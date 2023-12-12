import express from "express";
import * as console from "console";
import { companiesHandler } from "./handlers.js";

const app = express();

app.get("/companies", companiesHandler);

export const server = app.listen(3000, () => {
  console.log("Express up!");
});
