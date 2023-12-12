import { Request, Response } from "express";

export function getCompaniesHandler(req: Request, res: Response) {
  res.json("Companies");
}

export function getCompanyHandler(req: Request, res: Response) {
  const { params } = req;
  const companyId = Number(params["companyId"]);
  if (!companyId || Number.isNaN(companyId)) {
    res.status(400).send("Please provide a valid company ID");
    return;
  }

  res.json(companyId);
}
