import { Router } from "express";
import { authenticateRequest } from "../middlewares/authMiddleware";
import gamesController from "../controllers/game.controller";
import { createGameValidation, gameIdValidaton, getGameGraphData, getGameHistoryValidation, updateGameValidation } from "../middlewares/validations/game.validations";
import { validateRequest } from "../middlewares/validateRequest";
import { authorizeRoles } from "../middlewares/authorizeRole";
const router = Router();

router.get("/", gamesController.getAllGames);
router.get("/list", gamesController.getAllGamesWithoutPagination);
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
  authorizeRoles(['superAdmin','admin']),
  // createGameValidation,
  // validateRequest,
  gamesController.addGame
);
router.put(
  "/:gameId",
  authenticateRequest,
  authorizeRoles(['superAdmin','admin']),
  updateGameValidation,
  validateRequest,
  gamesController.updateGame
);
router.delete(
  "/:gameId",
  authenticateRequest,
  authorizeRoles(['superAdmin','admin']),
  gameIdValidaton,
  validateRequest,
  gamesController.deleteGame
);

router.get(
  "/get-grap-data/:gameId",
  authenticateRequest,
  authorizeRoles(['admin','superAdmin']),
  getGameGraphData,
  validateRequest,
  gamesController.getGameGraphData
);

router.get("/get/history",authenticateRequest,authorizeRoles(['admin','superAdmin']), getGameHistoryValidation, gamesController.getGameHistories)

export default router;
