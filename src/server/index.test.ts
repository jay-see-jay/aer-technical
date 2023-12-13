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
    expect(typeof response.body).toEqual("object");
    const data = response.body["data"];
    expect(Array.isArray(data)).toEqual(true);
    expect(response.body.data.length).toEqual(25);
  });

  it("/companies returns 50 items if limit is set to 50", async () => {
    const response = await request(server).get("/companies?limit=50");
    expect(response.headers["content-type"]).toMatch("/json");
    expect(response.status).toEqual(200);
    expect(typeof response.body).toEqual("object");
    const data = response.body["data"];
    expect(Array.isArray(data)).toEqual(true);
    expect(response.body.data.length).toEqual(50);
  });

  it("/companies starts from 26th company if offset is 25", async () => {
    const response = await request(server).get("/companies?offset=25");
    expect(response.headers["content-type"]).toMatch("/json");
    expect(response.status).toEqual(200);
    expect(typeof response.body).toEqual("object");
    const data = response.body["data"];
    expect(Array.isArray(data)).toEqual(true);
    const firstResult = response.body.data[0];
    expect(firstResult["id"]).toEqual(26);
  });

  it("/companies returns only inactive companies", async () => {
    const response = await request(server).get("/companies?active=0&limit=10");
    expect(response.headers["content-type"]).toMatch("/json");
    expect(typeof response.body).toEqual("object");
    const data = response.body["data"];
    expect(Array.isArray(data)).toEqual(true);
    for (const row of response.body.data) {
      expect(row["active"]).toEqual(false);
    }
  });

  it("/companies returns companies filtered by name", async () => {
    const name = "Anderson";
    const regex = new RegExp(name, "gi");
    const response = await request(server).get(`/companies?name=${name}`);
    expect(typeof response.body).toEqual("object");
    const data = response.body["data"];
    expect(Array.isArray(data)).toEqual(true);
    for (const row of response.body.data) {
      const companyName = row["name"];
      expect(typeof companyName).toEqual("string");
      if (typeof companyName != "string") continue;
      expect(companyName).toMatch(regex);
    }
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
