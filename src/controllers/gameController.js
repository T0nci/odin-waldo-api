const asyncHandler = require("express-async-handler");
const prisma = require("../client");
const { validationResult, param } = require("express-validator");
const jsonwebtoken = require("jsonwebtoken");

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
        expiresIn: "1d",
      });

      return res.json({ token });
    } catch (error) {
      if (error instanceof jsonwebtoken.JsonWebTokenError)
        res.json({ error: "Error creating JWT." });

      throw error;
    }
  }),
];

module.exports = {
  gameStartGet,
};
