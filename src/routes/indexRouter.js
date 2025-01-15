const { Router } = require("express");
const indexController = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/maps", indexController.mapsGet);
indexRouter.post("/name", indexController.namePost);

module.exports = indexRouter;
