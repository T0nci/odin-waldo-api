const asyncHandler = require("express-async-handler");
const { validationResult, body } = require("express-validator");
const prisma = require("../client");
const { confirmCookieToken } = require("../utils/authMiddleware");

const cleanUpUsers = asyncHandler(async (req, res, next) => {
  const userIds = (
    await prisma.$queryRaw`SELECT id FROM "User" WHERE name IS NULL AND started + interval '6h' < now() at time zone 'utc'`
  ).map((row) => row.id);

  await prisma.$transaction([
    prisma.guess.deleteMany({
      where: {
        user_id: {
          in: userIds,
        },
      },
    }),
    prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    }),
  ]);

  next();
});

const validateName = () =>
  body("name")
    .trim()
    .isAlphanumeric()
    .withMessage("Name must only contain letters and/or numbers")
    .isLength({ min: 1, max: 30 })
    .withMessage("Name must contain between 1 and 30 characters");

const mapsGet = asyncHandler(async (req, res) => {
  const maps = await prisma.$queryRaw`
    SELECT m.id, m.name, m.url, COUNT(*)::int AS "characters"
    FROM "Map" AS m
    JOIN "Character" AS c
    ON m.id = c.map_id
    GROUP BY m.id
  `;

  return res.json(maps);
});

const nameGet = [
  cleanUpUsers,
  confirmCookieToken,
  (req, res, next) => {
    if (req.user && req.user.total_time_s === null)
      return res.status(400).json({ error: "Game still in progress" });

    if (req.user && req.user.name)
      return res
        .cookie("token", "", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 0, // maxAge 0 to clear the cookie
        })
        .status(400)
        .json({ error: "Name already entered" });

    // this means that the token was valid but the game was deleted
    if (req.user === null)
      return res
        .cookie("token", "", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 0, // maxAge 0 to clear the cookie
        })
        .status(404)
        .json({ error: "Game not found" });

    if (req.middlewareError)
      return res
        .cookie("token", "", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 0,
        })
        .status(401)
        .json({ error: req.middlewareError });

    next();
  },
  asyncHandler(async (req, res) => {
    const map = await prisma.map.findUnique({
      where: {
        id: req.user.map_id,
      },
    });

    res.json({ totalTimeInSeconds: req.user.total_time_s, map: map.name });
  }),
];

const namePost = [
  confirmCookieToken,
  asyncHandler(async (req, res, next) => {
    if (req.user && req.user.total_time_s === null)
      return res.status(400).json({ error: "Game still in progress" });

    if (req.user && req.user.name)
      return res
        .cookie("token", "", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 0, // maxAge 0 to clear the cookie
        })
        .status(400)
        .json({ error: "Name already entered" });

    // this means that the token was valid but the game was deleted
    if (req.user === null)
      return res
        .cookie("token", "", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 0, // maxAge 0 to clear the cookie
        })
        .status(404)
        .json({ error: "Game not found" });

    if (req.middlewareError)
      return res
        .cookie("token", "", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 0,
        })
        .status(401)
        .json({ error: req.middlewareError });

    next();
  }),
  validateName(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array()[0].msg });

    await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        name: req.body.name,
      },
    });

    res.json({ result: "Name updated" });
  }),
];

const leaderboardGet = [
  cleanUpUsers,
  asyncHandler(async (req, res) => {
    const maps = await prisma.map.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    for (const map of maps) {
      // typecast to integer because RANK returns BigInt for some reason???
      const leaderboard = await prisma.$queryRaw`
        SELECT u.id AS id, u.name AS username, u.total_time_s AS "totalTimeInSeconds", RANK() OVER (ORDER BY u.total_time_s)::int AS num
        FROM "User" AS u
        JOIN "Map" AS m
        ON u.map_id = m.id
        WHERE u.name IS NOT NULL AND m.id = ${map.id}
        ORDER BY u.total_time_s;
      `;

      map.leaderboard = leaderboard;
    }

    res.json(maps);
  }),
];

module.exports = {
  mapsGet,
  nameGet,
  namePost,
  leaderboardGet,
};
