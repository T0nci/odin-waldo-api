const { Router } = require("express");
const indexController = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/maps", indexController.mapsGet);
indexRouter.get("/name", indexController.nameGet);
indexRouter.post("/name", indexController.namePost);
indexRouter.get("/leaderboard", indexController.leaderboardGet);

module.exports = indexRouter;
