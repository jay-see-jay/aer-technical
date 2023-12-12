import { server } from "./index.js";
import request from "supertest";
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
  });
});
