import express, { Request } from "express";
import * as console from "console";
import { getCompaniesHandler, getCompanyHandler } from "./handlers.js";

const app = express();

app.get("/companies", getCompaniesHandler);

app.get("/companies/:companyId", getCompanyHandler);

export const server = app.listen(3000, () => {
  console.log("Express up!");
});
