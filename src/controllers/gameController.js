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
  asyncHandler(async (req, res) => {
    console.log(req.numm);
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
  }),
];

module.exports = {
  gameStartGet,
  guessPost,
};
