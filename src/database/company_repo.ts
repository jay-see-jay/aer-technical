import fs from "fs";
import { CompanyWithEmployee, Filters, IDatabase } from "./types";
import { isValidCompany, isValidEmployee } from "../shared/helpers.js";
import { InArgs } from "@libsql/client";
import * as console from "console";

class CompanyRepo {
  private getCompanyStatement: string;
  private getCompaniesStatement: string;
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.getCompanyStatement = fs
      .readFileSync("src/database/get_company.sql")
      .toString();

    this.getCompaniesStatement = fs
      .readFileSync("src/database/get_companies.sql")
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

  async getCompanies(
    limit: number,
    offset: number,
    filters: Filters,
  ): Promise<CompanyWithEmployee[]> {
    let statement = this.getCompaniesStatement;
    const args: InArgs = [limit, offset];
    const filterStatements: string[] = [];
    const filterArgs: InArgs = [];
    if (filters.active != undefined) {
      filterStatements.push("active = ?");
      filterArgs.push(filters.active);
    }
    if (filters.name) {
      filterStatements.push("name LIKE ?");
      filterArgs.push(`%${filters.name}%`);
    }
    args.unshift(...filterArgs);
    if (filterStatements.length > 0) {
      statement = this.getCompaniesStatement.replace(
        /{filter}/,
        `WHERE ${filterStatements.join(" AND ")}`,
      );
    } else {
      statement = this.getCompaniesStatement.replace(/{filter}/, "");
    }
    const result = await this.db.read({
      sql: statement,
      args: args,
    });

    const { rows } = result;

    const firstResult = rows[0];
    if (!firstResult) return [];

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

    return Array.from(companies.values());
  }
}

export default CompanyRepo;
