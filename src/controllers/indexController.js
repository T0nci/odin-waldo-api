const asyncHandler = require("express-async-handler");
const prisma = require("../client");

const mapsGet = asyncHandler(async (req, res) => {
  const maps = await prisma.map.findMany({
    select: {
      name: true,
      url: true,
    },
  });

  return res.json(maps);
});

module.exports = {
  mapsGet,
};
