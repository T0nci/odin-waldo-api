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

const characters = [
  {
    id: 1,
    name: "Test Character 1",
    map_id: 1,
    url: "Test URL 3",
    start: [0, 0],
    end: [2, 2],
  },
  {
    id: 2,
    name: "Test Character 2",
    map_id: 1,
    url: "Test URL 4",
    start: [3, 3],
    end: [5, 5],
  },
  {
    id: 3,
    name: "Test Character 3",
    map_id: 2,
    url: "Test URL 5",
    start: [6, 6],
    end: [8, 8],
  },
];

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

describe("indexRouter", () => {
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
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe("/start/:mapId", () => {
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

      expect(response.header["set-cookie"].length).toBe(2);

      expect(typeof user).toBe("object");
      expect(user.map_id).toBe(1);
    });
  });

  describe("/guess/:charId", () => {
    afterEach(async () => {
      await prisma.guess.deleteMany();
    });

    beforeAll(async () => {
      await prisma.character.createMany({
        data: characters,
      });
    });

    afterAll(async () => {
      await prisma.character.deleteMany();
    });

    test("/guess/:charId returns error there is no token", async () => {
      const response = await request(app)
        .post("/game/guess/1")
        .set("Accept", "application/json; charset=utf-8");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("401: Unauthorized");
    });

    test("/guess/:charId returns error when token is invalid", async () => {
      const response = await request(app)
        .post("/game/guess/1")
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=invalidToken"]);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("401: Unauthorized");
    });

    test("/guess/:charId returns error when game is ended", async () => {
      const cookies = await request(app)
        .get("/game/start/1")
        .set("Accept", "application/json; charset=utf-8");
      // grabs the first cookie, parses it for the name value pair
      // then parses that for the value only
      const cookie = cookies.header["set-cookie"][0]
        .split("; ")[0]
        .split("=")[1];

      // update the game to be finished
      await prisma.user.updateMany({
        data: {
          total_time_s: 1,
        },
      });

      const response = await request(app)
        .post("/game/guess/1")
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Game ended");
    });

    test("/guess/:charId returns error when game is deleted", async () => {
      const cookies = await request(app)
        .get("/game/start/1")
        .set("Accept", "application/json; charset=utf-8");
      const cookie = cookies.header["set-cookie"][0]
        .split("; ")[0]
        .split("=")[1];

      // delete the game
      await prisma.user.deleteMany();

      const response = await request(app)
        .post("/game/guess/1")
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Game not found");
    });

    test("/guess/:charId returns error when character ID is invalid", async () => {
      const cookies = await request(app)
        .get("/game/start/1")
        .set("Accept", "application/json; charset=utf-8");
      const cookie = cookies.header["set-cookie"][0]
        .split("; ")[0]
        .split("=")[1];

      const response = await request(app)
        .post("/game/guess/invalidCharId")
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid character");
    });

    test("/guess/:charId returns error when character ID is not on the player map", async () => {
      const cookies = await request(app)
        .get("/game/start/1")
        .set("Accept", "application/json; charset=utf-8");
      const cookie = cookies.header["set-cookie"][0]
        .split("; ")[0]
        .split("=")[1];

      const response = await request(app)
        // ID is 3 because the third character(in the above array)
        // is not on the first map
        .post("/game/guess/3")
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid character");
    });

    test("/guess/:charId returns error when X coordinate is not valid", async () => {
      const cookies = await request(app)
        .get("/game/start/1")
        .set("Accept", "application/json; charset=utf-8");
      const cookie = cookies.header["set-cookie"][0]
        .split("; ")[0]
        .split("=")[1];

      const response = await request(app)
        // ID is 3 because the third character(in the above array)
        // is not on the first map
        .post("/game/guess/1")
        .send({ x: "invalid", y: 1 })
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid coordinates");
    });

    test("/guess/:charId returns error when Y coordinate is not valid", async () => {
      const cookies = await request(app)
        .get("/game/start/1")
        .set("Accept", "application/json; charset=utf-8");
      const cookie = cookies.header["set-cookie"][0]
        .split("; ")[0]
        .split("=")[1];

      const response = await request(app)
        // ID is 3 because the third character(in the above array)
        // is not on the first map
        .post("/game/guess/1")
        .send({ x: 1, y: -10 })
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid coordinates");
    });

    test("/guess/:charId returns feedback when guess X coordinate is incorrect", async () => {
      const cookies = await request(app)
        .get("/game/start/1")
        .set("Accept", "application/json; charset=utf-8");
      const cookie = cookies.header["set-cookie"][0]
        .split("; ")[0]
        .split("=")[1];

      const response = await request(app)
        .post("/game/guess/1")
        .send({ x: 5, y: 0 })
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      expect(response.status).toBe(200);
      expect(response.body.result).toBe("Incorrect guess");
    });

    test("/guess/:charId returns feedback when guess Y coordinate is incorrect", async () => {
      const cookies = await request(app)
        .get("/game/start/1")
        .set("Accept", "application/json; charset=utf-8");
      const cookie = cookies.header["set-cookie"][0]
        .split("; ")[0]
        .split("=")[1];

      const response = await request(app)
        .post("/game/guess/1")
        .send({ x: 0, y: 5 })
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      expect(response.status).toBe(200);
      expect(response.body.result).toBe("Incorrect guess");
    });

    test("/guess/:charId returns feedback when guess is correct", async () => {
      const cookies = await request(app)
        .get("/game/start/1")
        .set("Accept", "application/json; charset=utf-8");
      const cookie = cookies.header["set-cookie"][0]
        .split("; ")[0]
        .split("=")[1];

      const response = await request(app)
        .post("/game/guess/1")
        .send({ x: 0, y: 0 })
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      const guess = await prisma.guess.findFirst();

      expect(typeof guess).toBe("object");
      expect(guess.char_id).toBe(1);
      expect(response.status).toBe(200);
      expect(response.body.result).toBe("Correct guess");
    });

    test("/guess/:charId returns feedback when character is already guessed", async () => {
      const cookies = await request(app)
        .get("/game/start/1")
        .set("Accept", "application/json; charset=utf-8");
      const cookie = cookies.header["set-cookie"][0]
        .split("; ")[0]
        .split("=")[1];

      await request(app)
        .post("/game/guess/1")
        .send({ x: 0, y: 0 })
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      const response = await request(app)
        .post("/game/guess/1")
        .send({ x: 0, y: 0 })
        .set("Accept", "application/json; charset=utf-8")
        .set("Cookie", ["token=" + cookie]);

      const guesses = await prisma.guess.findMany();
      const user = await prisma.user.findFirst();

      expect(guesses.length).toBe(1);
      expect(user.total_time_s).toBeNull();
      expect(response.status).toBe(200);
      expect(response.body.result).toBe("Already guessed");
    });
  });
});
