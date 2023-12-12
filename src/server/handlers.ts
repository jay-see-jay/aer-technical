import { Request, Response } from "express";

export function companiesHandler(req: Request, res: Response) {
  res.json("Companies");
}
