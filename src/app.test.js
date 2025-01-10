const request = require("supertest");
const {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} = require("@jest/globals");
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

  test("/maps returns maps in JSON", async () => {
    // the reason async await works because is returns a promise and jest waits for a resolve or rejection
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

    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
    expect(response.body).toStrictEqual(mapsWithoutId);
  });
});

describe("gameRouter", () => {
  beforeAll(async () => {
    await prisma.map.createMany({
      data: maps,
    });
  });

  afterAll(async () => {
    await prisma.map.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test("/start/:mapId returns error when mapId is invalid", async () => {
    const response = await request(app)
      .get("/game/start/invalidMapId")
      .set("Accept", "application/json; charset=utf-8");

    expect(response.status).toBe(400);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
    expect(response.body).toStrictEqual({
      error: "Invalid map ID.",
    });
  });

  test("/start/:mapId returns token and creates user successfully", async () => {
    const response = await request(app)
      .get("/game/start/1")
      .set("Accept", "application/json; charset=utf-8");

    const user = await prisma.user.findFirst();

    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
    expect(typeof response.body.token).toBe("string");
    expect(typeof user).toBe("object");
    expect(user.map_id).toBe(1);
  });
});
