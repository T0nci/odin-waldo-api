const { Router } = require("express");
const indexController = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/maps", indexController.mapsGet);

module.exports = indexRouter;
