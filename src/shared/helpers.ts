import fs from "fs";
import { Row } from "@libsql/client";
import { CompanyWithEmployee, Employee } from "../database/types";
import * as console from "console";

export function readJsonFile(path: string): any {
  const buf = fs.readFileSync(path);
  return JSON.parse(buf.toString());
}

export function isValidCompany(row: Row): CompanyWithEmployee | undefined {
  const keys = new Map<string, string>([
    ["id", "number"],
    ["name", "string"],
    ["industry", "string"],
    ["active", "number"],
    ["website", "string"],
    ["telephone", "string"],
    ["slogan", "string"],
    ["address", "string"],
    ["city", "string"],
    ["country", "string"],
  ]);
  let isValid = true;
  for (const [key, type] of keys.entries()) {
    if (!(key in row) || typeof row[key] != type) {
      isValid = false;
    }
  }
  if (!isValid) return undefined;
  return {
    id: row["id"] as number,
    name: row["name"] as string,
    industry: row["industry"] as string,
    active: Boolean(row["active"] as number),
    website: row["website"] as string,
    telephone: row["telephone"] as string,
    slogan: row["slogan"] as string,
    address: row["address"] as string,
    city: row["city"] as string,
    country: row["country"] as string,
    employees: [],
  };
}

export function isValidEmployee(
  row: Row,
): Omit<Employee, "company_id" | "id"> | undefined {
  const keys = new Map<string, string[]>([
    ["employee_first_name", ["string"]],
    ["employee_last_name", ["string"]],
    ["employee_email", ["string", "null"]],
    ["employee_role", ["string"]],
  ]);
  let isValid = true;
  for (const [key, type] of keys.entries()) {
    if (!(key in row) || !type.includes(typeof row[key])) {
      isValid = false;
    }
  }
  if (!isValid) return undefined;
  const email = (row["employee_email"] as string) || null;
  return {
    first_name: row["employee_first_name"] as string,
    last_name: row["employee_last_name"] as string,
    email,
    role: row["employee_role"] as string,
  };
}
