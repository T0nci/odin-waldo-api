const prisma = require("../client");
const jsonwebtoken = require("jsonwebtoken");

const confirmCookieToken = async (req, res, next) => {
  if (!req.cookies.token) {
    req.middlewareError = "401: Unauthorized";
    return next();
  }

  try {
    const decoded = jsonwebtoken.verify(
      req.cookies.token,
      process.env.JWT_SECRET,
    );

    req.user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    next();
  } catch (error) {
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      req.middlewareError = "401: Unauthorized";
      return next();
    }

    next(error);
  }
};

module.exports = {
  confirmCookieToken,
};
