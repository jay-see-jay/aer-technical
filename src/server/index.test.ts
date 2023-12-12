import { server } from "./index.js";
import request from "supertest";
import validator from "../shared/validator.js";
import * as console from "console";

afterAll(() => {
  server.close();
});

describe("API", () => {
  it("Unmatched paths return 404", async () => {
    const response = await request(server).get("/");
    expect(response.status).toEqual(404);
  });

  it("/companies returns valid json", async () => {
    const response = await request(server).get("/companies");
    expect(response.headers["content-type"]).toMatch("/json");
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toEqual(true);
    expect(response.body.length).toEqual(50);
    const { valid } = validator.doesMatchCompanySchema(response.body);
    expect(valid).toEqual(true);
  });

  it("/companies/:id returns single company", async () => {
    const response = await request(server).get("/companies/100");
    expect(response.headers["content-type"]).toMatch("/json");
    expect(response.status).toEqual(200);
    expect(typeof response.body).toEqual("object");
    const { valid } = validator.doesMatchEmployeeSchema(response.body);
    expect(valid).toEqual(true);
  });

  it("/companies/:id returns 400 if invalid company id", async () => {
    const response = await request(server).get("/companies/X");
    expect(response.status).toEqual(400);
    expect(response.text).toEqual("Please provide a valid company ID");
  });
});
