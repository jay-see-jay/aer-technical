import { Validator, ValidatorResult } from "jsonschema";
import { readJsonFile } from "./helpers";

export type Entities = "companies" | "employees";

class JSONValidator {
  private v: Validator;
  private employeeSchema: any;
  private companySchema: any;

  constructor() {
    this.v = new Validator();
    this.employeeSchema = readJsonFile("src/data/schemas/companies.json");
    this.companySchema = readJsonFile("src/data/schemas/employees.json");
  }

  doesMatchCompanySchema(json: any): ValidatorResult {
    return this.v.validate(json, this.companySchema);
  }

  doesMatchEmployeeSchema(json: any) {
    return this.v.validate(json, this.employeeSchema);
  }

  doesMatchSchema(entity: Entities, json: any): ValidatorResult {
    if (entity === "companies") {
      return this.doesMatchCompanySchema(json);
    }

    if (entity === "employees") {
      return this.doesMatchEmployeeSchema(json);
    }

    throw Error(`Unknown entity type: ${entity}`);
  }
}

const validator = new JSONValidator();

export default validator;
