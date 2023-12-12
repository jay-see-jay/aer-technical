import fs from "fs";
import { CompanyWithEmployee, IDatabase } from "./types";
import { isValidCompany, isValidEmployee } from "../shared/helpers.js";

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
    active?: number,
  ): Promise<CompanyWithEmployee[]> {
    let statement = this.getCompaniesStatement;
    const args = [limit, offset];
    if (active != undefined) {
      statement = this.getCompaniesStatement.replace(
        /{filter}/,
        "WHERE active = ?",
      );
      args.unshift(active);
    } else {
      statement = this.getCompaniesStatement.replace(/{filter}/, "");
    }
    console.log("statement", statement);
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
