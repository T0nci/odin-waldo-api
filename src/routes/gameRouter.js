const { Router } = require("express");
const gameController = require("../controllers/gameController");

const gameRouter = Router();

gameRouter.get("/start/:mapId", gameController.gameStartGet);
gameRouter.post("/guess/:charId", gameController.guessPost);

module.exports = gameRouter;
