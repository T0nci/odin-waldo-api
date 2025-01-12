const asyncHandler = require("express-async-handler");
const prisma = require("../client");
const { validationResult, param } = require("express-validator");
const jsonwebtoken = require("jsonwebtoken");
const { confirmCookieToken } = require("../utils/authMiddleware");

const validateMapId = () =>
  param("mapId")
    .custom(async (mapId) => {
      const map = await prisma.map.findUnique({
        where: {
          id: Number(mapId),
        },
      });

      if (!map) throw false;
    })
    .withMessage("Invalid map ID.");

const validateCharId = () =>
  param("charId").custom(async (charId, { req }) => {
    const character = await prisma.character.findUnique({
      where: {
        id: Number(charId),
      },
    });

    if (character.map_id !== req.user.map_id) throw false;
  });

const gameStartGet = [
  validateMapId(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array()[0].msg });

    const user = await prisma.user.create({
      data: {
        map_id: Number(req.params.mapId),
      },
    });

    try {
      const token = jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "6h",
      });

      return (
        res
          .cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 1000 * 60 * 60 * 6,
          })
          // a cookie accessible by JavaScript with no sensitive
          // information just to have React state base itself on
          // something
          .cookie("game", "active", {
            sameSite: "none",
            secure: true,
            maxAge: 1000 * 60 * 60 * 6,
          })
          .json({
            status: 200,
          })
      );
    } catch (error) {
      if (error instanceof jsonwebtoken.JsonWebTokenError)
        res.json({ error: "Error creating JWT." });

      throw error;
    }
  }),
];

const guessPost = [
  confirmCookieToken,
  async (req, res, next) => {
    if (req.user && req.user.total_time_s)
      return res.status(400).json({ error: "Game ended" });

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
  },
  validateCharId(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: "Invalid character" });

    // TODO:
    // - check if character is in the correct position
    // - if not - return error
    // - if yes - continue
    // - next check if character is already guessed
    // - then check if user guessed all characters
    // - if not return correct guess
    // - if yes remove guesses set time and return end game
  }),
];

module.exports = {
  gameStartGet,
  guessPost,
};
