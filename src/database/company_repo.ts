import fs from "fs";
import {
  CompanyWithEmployee,
  Filters,
  IDatabase,
  PaginatedData,
  ResultsCount,
} from "./types";
import { isValidCompany, isValidEmployee } from "../shared/helpers.js";
import { InValue, Row } from "@libsql/client";
import * as console from "console";

class CompanyRepo {
  private getCompanyStatement: string;
  private getCompaniesStatement: string;
  private countCompaniesStatement: string;
  private getCompaniesByEmployeeStatement: string;
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.getCompanyStatement = fs
      .readFileSync("src/database/get_company.sql")
      .toString();

    this.getCompaniesStatement = fs
      .readFileSync("src/database/get_companies.sql")
      .toString();

    this.countCompaniesStatement = fs
      .readFileSync("src/database/get_total_companies.sql")
      .toString();

    this.getCompaniesByEmployeeStatement = fs
      .readFileSync("src/database/get_companies_by_employee_name.sql")
      .toString();

    this.db = db;
  }

  async getById(id: number): Promise<CompanyWithEmployee | undefined> {
    const result = await this.db.read({
      sql: this.getCompanyStatement,
      args: [id],
    });

    const { rows } = result;

    const firstResult = rows[0];
    if (!firstResult) return undefined;

    const company = isValidCompany(firstResult);
    if (!company) return undefined;

    for (const row of rows) {
      const employee = isValidEmployee(row);
      if (!employee) continue;
      company.employees.push(employee);
    }

    return company;
  }

  insertFilters(statements: string[], statement: string): string {
    let statementWithFilters = statement;
    if (statements.length > 0) {
      statementWithFilters = statement.replace(
        /{filter}/,
        `WHERE ${statements.join(" AND ")}`,
      );
    } else {
      statementWithFilters = statement.replace(/{filter}/, "");
    }
    return statementWithFilters;
  }

  addFilters(filters: Filters): { statements: string[]; args: InValue[] } {
    const filterStatements: string[] = [];
    const filterArgs: InValue[] = [];

    if (filters.active != undefined) {
      filterStatements.push("active = ?");
      filterArgs.push(filters.active);
    }
    if (filters.name) {
      filterStatements.push("name LIKE ?");
      filterArgs.push(`%${filters.name}%`);
    }

    return {
      statements: filterStatements,
      args: filterArgs,
    };
  }

  validateCountRow(row: Row): ResultsCount {
    const keys = ["first", "last", "count"] as const;

    let first: number;
    let last: number;
    let count: number;
    for (const key of keys) {
      const value = row[key];
      if (!(key in row) || typeof value !== "number") {
        throw Error(
          `Could not identify ${key} when validating number of possible results`,
        );
      }
      if (key === "first") {
        first = value;
      }
      if (key === "last") {
        last = value;
      }
      if (key === "count") {
        count = value;
      }
    }

    return {
      first: first!,
      last: last!,
      count: count!,
    };
  }

  async countResults(
    filters: string[],
    args: InValue[],
  ): Promise<ResultsCount> {
    const statement = this.insertFilters(filters, this.countCompaniesStatement);

    const result = await this.db.read({
      sql: statement,
      args: args,
    });

    const firstResult: Row | undefined = result.rows[0];

    if (!firstResult) {
      throw Error("Failed to count number of possible results");
    }

    return this.validateCountRow(firstResult);
  }

  async getCompanies(
    limit: number,
    offset: number,
    url: URL,
    filters: Filters,
  ): Promise<PaginatedData<CompanyWithEmployee[]>> {
    let statement: string;
    let args: InValue[];
    const { statements: filterStatements, args: filterArgs } =
      this.addFilters(filters);

    if (filters.employee) {
      statement = this.getCompaniesByEmployeeStatement;
      args = [`%${filters.employee}%`];
    } else {
      args = [limit, offset];
      statement = this.insertFilters(
        filterStatements,
        this.getCompaniesStatement,
      );
      args.unshift(...filterArgs);
    }

    const result = await this.db.read({
      sql: statement,
      args: args,
    });

    const count = await this.countResults(filterStatements, filterArgs);

    const { rows } = result;

    const firstResult = rows[0];
    if (!firstResult) return { data: [] };

    const companies = new Map<number, CompanyWithEmployee>();

    for (const row of rows) {
      const company = isValidCompany(row);
      if (!company) continue;
      if (!companies.has(company.id)) {
        companies.set(company.id, company);
      }

      const employee = isValidEmployee(row);
      if (!employee) continue;

      const existingCompany = companies.get(company.id)!;
      existingCompany.employees.push(employee);
      companies.set(company.id, existingCompany);
    }

    const paginatedData: PaginatedData<CompanyWithEmployee[]> = {
      data: Array.from(companies.values()),
    };

    const companyIds = Array.from(companies.keys()).sort((a, b) => a - b);
    const firstCompanyId = companyIds[0];
    const lastCompanyId = companyIds[companyIds.length - 1];
    if (
      firstCompanyId &&
      lastCompanyId &&
      count.count > companyIds.length &&
      !filters.employee
    ) {
      if (firstCompanyId > count.first) {
        url.searchParams.set("offset", `${offset - limit}`);
        paginatedData.prev = `${url.origin}${url.pathname}${url.search}`;
      }
      if (lastCompanyId < count.last) {
        url.searchParams.set("offset", `${offset + limit}`);
        console.log("url", url);
        paginatedData.next = `${url.origin}${url.pathname}${url.search}`;
      }
    }

    return paginatedData;
  }
}

export default CompanyRepo;
