const request = require("supertest");
const { describe, it, expect, beforeAll, afterAll } = require("@jest/globals");
const prisma = require("./client");
const app = require("./app");

const maps = [
  {
    id: 1, // an ID so the tests don't autoincrement infinitely
    name: "Test Map 1",
    url: "Test URL 1",
  },
  {
    id: 2, // an ID so the tests don't autoincrement infinitely
    name: "Test Map 2",
    url: "Test URL 2",
  },
];

describe("indexRouter", () => {
  beforeAll(() => {
    return prisma.map.createMany({
      data: maps,
    });
  });

  afterAll((done) => {
    prisma.map
      .deleteMany()
      .then(() => done())
      .catch(done);
  });

  it("responds with JSON", async () => {
    // the reason async await works because is returns a promise and jest waits for a resolve or rejection
    const response = await request(app)
      .get("/maps")
      .set("Accept", "application/json");

    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
  });

  it("returns maps", async () => {
    const response = await request(app)
      .get("/maps")
      .set("Accept", "application/json");

    const mapsWithoutId = [
      {
        name: "Test Map 1",
        url: "Test URL 1",
      },
      {
        name: "Test Map 2",
        url: "Test URL 2",
      },
    ];

    console.log(response.body);
    expect(response.body).toStrictEqual(mapsWithoutId);
  });
});
