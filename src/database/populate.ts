import { Validator } from "jsonschema";
import fs from "fs";
import * as console from "console";

const v = new Validator();

const companyDataFiles = fs.readdirSync("src/data/companies");
const employeeDataFiles = fs.readdirSync("src/data/employees");

const companySchema = readJsonFile("src/data/schemas/companies.json");
const employeeSchema = readJsonFile("src/data/schemas/employees.json");

type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string;
  company_id: number | null;
};

type Company = {
  id: number;
  name: string;
  industry: string;
  active: boolean;
  website: string;
  telephone: string;
  slogan: string;
  address: string;
  city: string;
  country: string;
};

function readJsonFile(path: string): any {
  const buf = fs.readFileSync(path);
  return JSON.parse(buf.toString());
}

function validateJson<T>(entity: "companies" | "employees", file: string): T[] {
  const schema = entity === "companies" ? companySchema : employeeSchema;
  const fileContents = readJsonFile(`src/data/${entity}/${file}`);
  const result = v.validate(fileContents, schema);
  if (!Array.isArray(result.instance)) {
    throw Error("TODO : Handle errors when JSON is not a valid array");
  }
  if (!result.valid) {
    result.errors.forEach((error) => {
      const { path } = error;

      const arrayIndex = path[0];
      if (typeof arrayIndex != "number") {
        throw Error("Array index should be a number");
      }

      result.instance.splice(arrayIndex, 1);
    });
  }
  return result.instance as T[];
}

const companies: Company[] = [];
const employees: Employee[] = [];

companyDataFiles.forEach((file) => {
  const result = validateJson<Company>("companies", file);
  companies.push(...result);
});

employeeDataFiles.forEach((file) => {
  const result = validateJson<Employee>("employees", file);
  employees.push(...result);
});
