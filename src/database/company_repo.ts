import fs from "fs";
import { CompanyWithEmployee, IDatabase } from "./types";
import { isValidCompany, isValidEmployee } from "../shared/helpers.js";
import * as console from "console";

class CompanyRepo {
  private getCompanyStatement: string;
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.getCompanyStatement = fs
      .readFileSync("src/database/get_company.sql")
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
}

export default CompanyRepo;
