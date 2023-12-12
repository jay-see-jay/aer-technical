import fs from "fs";
import database, { BatchStatement } from "./index.js";
import * as process from "process";
import { readJsonFile } from "../shared/helpers.js";
import validator, { Entities } from "../shared/validator.js";

const db = database;

if (await db.isPopulated()) {
  console.log("Database already populated");
  process.exit(0);
}

const companyDataFiles = fs.readdirSync("src/data/companies");
const employeeDataFiles = fs.readdirSync("src/data/employees");

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

function validateJson<T>(entity: Entities, file: string): (T | null)[] {
  const fileContents = readJsonFile(`src/data/${entity}/${file}`);
  const result = validator.doesMatchSchema(entity, fileContents);
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

      result.instance[arrayIndex] = null;
    });
  }
  return result.instance as (T | null)[];
}

const companies: Company[] = [];
const employees: Employee[] = [];

companyDataFiles.forEach((file) => {
  const result = validateJson<Company>("companies", file);
  result.forEach((company) => {
    if (company === null) return;
    companies.push(company);
  });
});

employeeDataFiles.forEach((file) => {
  const result = validateJson<Employee>("employees", file);
  result.forEach((employee) => {
    if (employee === null) return;
    employees.push(employee);
  });
});

const createCompanyTable = fs
  .readFileSync("src/database/create_tables.sql")
  .toString();

try {
  await db.run(createCompanyTable);
} catch (e) {
  console.log("e", e);
}

const insertCompanyStatements = companies.map((company): BatchStatement => {
  const active = company.active ? 1 : 0;
  return {
    sql: "INSERT INTO company(id, name, industry, active, website, telephone, slogan, address, city, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      company.id,
      company.name,
      company.industry,
      active,
      company.website,
      company.telephone,
      company.slogan,
      company.address,
      company.city,
      company.country,
    ],
  };
});

const insertEmployeeStatements = employees.map((employee): BatchStatement => {
  if (employee.role === null) {
    console.log("employee", employee);
  }
  return {
    sql: "INSERT INTO employee(id, first_name, last_name, email, role, company_id) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      employee.id,
      employee.first_name,
      employee.last_name,
      employee.email,
      employee.role,
      employee.company_id,
    ],
  };
});

try {
  console.log("Inserting companies...");
  await db.insertBatch(insertCompanyStatements);
} catch (e) {
  console.log("e", e);
}

try {
  console.log("Inserting employees...");
  await db.insertBatch(insertEmployeeStatements);
} catch (e) {
  console.log("e", e);
}
