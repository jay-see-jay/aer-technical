import { Request, Response } from "express";
import CompanyRepo from "../database/company_repo.js";
import database from "../database/index.js";
import * as console from "console";

const repo = new CompanyRepo(database);

export async function getCompaniesHandler(req: Request, res: Response) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  const limit = Number(req.query["limit"]) || 25;
  const offset = Number(req.query["offset"]) || 0;

  const activeParam = Number(req.query["active"]);
  let active: number | undefined = undefined;
  if (activeParam != undefined && !Number.isNaN(activeParam)) {
    active = activeParam;
  }
  const name = (req.query["name"] as string) || undefined;
  const employee = (req.query["employee"] as string) || undefined;

  const companies = await repo.getCompanies(limit, offset, url, {
    active,
    name,
    employee,
  });
  res.json(companies);
}

export async function getCompanyHandler(req: Request, res: Response) {
  const { params } = req;
  const companyId = Number(params["companyId"]);
  if (!companyId || Number.isNaN(companyId)) {
    res.status(400).send("Please provide a valid company ID");
    return;
  }
  const company = await repo.getById(companyId);
  if (!company) {
    res.status(404).send("Not found.");
    return;
  }
  res.json(company);
}
