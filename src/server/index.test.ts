import { server } from "./index.js";
import request from "supertest";

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
    expect(response.body.length).toEqual(25);
  });

  it("/companies returns 50 items if limit is set to 50", async () => {
    const response = await request(server).get("/companies?limit=50");
    expect(response.headers["content-type"]).toMatch("/json");
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toEqual(true);
    expect(response.body.length).toEqual(50);
  });

  it("/companies starts from 26th company if offset is 25", async () => {
    const response = await request(server).get("/companies?offset=25");
    expect(response.headers["content-type"]).toMatch("/json");
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toEqual(true);
    const firstResult = response.body[0];
    expect(firstResult["id"]).toEqual(26);
  });

  it("/companies/:id returns single company", async () => {
    const response = await request(server).get("/companies/100");
    expect(response.headers["content-type"]).toMatch("/json");
    expect(response.status).toEqual(200);
    expect(typeof response.body).toEqual("object");
  });

  it("/companies/:id returns 400 if invalid company id", async () => {
    const response = await request(server).get("/companies/X");
    expect(response.status).toEqual(400);
    expect(response.text).toEqual("Please provide a valid company ID");
  });
});
