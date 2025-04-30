import { Router } from "express";
import { authenticateRequest } from "../middlewares/authMiddleware";
import gamesController from "../controllers/game.controller";
import { createGameValidation,gameIdValidaton, getGameHistoryValidation, updateGameValidation } from "../middlewares/validations/game.validations";
import { validateRequest } from "../middlewares/validateRequest";
const router = Router();

router.get("/", gamesController.getAllGames);
router.get(
  "/:gameId",
  authenticateRequest,
  gameIdValidaton,
validateRequest,
  gamesController.getGame
);
router.post(
  "/",
  authenticateRequest,
  // createGameValidation,
  // validateRequest,
  gamesController.addGame
);
router.put(
  "/:gameId",
  authenticateRequest,
  updateGameValidation,
  validateRequest,
  gamesController.updateGame
);
router.delete(
  "/:gameId",
  authenticateRequest,
  gameIdValidaton,
  validateRequest,
  gamesController.deleteGame
);
router.get("/get/history",getGameHistoryValidation,gamesController.getGameHistories)

export default router;
