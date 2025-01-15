const asyncHandler = require("express-async-handler");
const prisma = require("../client");
const { confirmCookieToken } = require("../utils/authMiddleware");

const mapsGet = asyncHandler(async (req, res) => {
  const maps = await prisma.map.findMany({
    select: {
      name: true,
      url: true,
    },
  });

  return res.json(maps);
});

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
        .cookie("game", "active", {
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
        .cookie("game", "active", {
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
        .cookie("game", "active", {
          sameSite: "none",
          secure: true,
          maxAge: 0,
        })
        .status(401)
        .json({ error: req.middlewareError });

    next();
  }),
  asyncHandler(async (req, res) => {
    res.json({ result: "Name updated" });
  }),
];

module.exports = {
  mapsGet,
  namePost,
};
