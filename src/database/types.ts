import { InStatement, ResultSet } from "@libsql/client";

export type IDatabase = {
  run(statement: string): Promise<void>;
  read(statement: InStatement): Promise<ResultSet>;
  insertBatch(statements: InStatement[]): Promise<ResultSet[]>;
  isPopulated(): Promise<boolean>;
};

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string;
  company_id: number | null;
};

export type Company = {
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

export type CompanyWithEmployee = Company & {
  employees: Omit<Employee, "company_id" | "id">[];
};
