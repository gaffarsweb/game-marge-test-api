import { Router } from "express";
import practiceGames from "../controllers/practiceGame.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { gameIdValidaton } from "../middlewares/validations/game.validations";
import { validateGameIdForPracticeGame } from "../middlewares/validations/practicegame.validations";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.post(
  "/",
  authenticateRequest,
  authorizeRoles(['superAdmin','admin']),
  practiceGames.createNewPracticeGame
);

router.get(
  "/game",
  validateGameIdForPracticeGame,
  validateRequest,
  practiceGames.getAllPracticeGameByGameId
);

router.get(
  "/:practiceGameId",
  validateRequest,
  practiceGames.getSubgame
);

router.put(
  "/:practiceGameId",
  authenticateRequest,
  authorizeRoles(['admin','superAdmin']),
  practiceGames.updateSubgame
)

router.delete(
  "/:practiceGameId",
  authenticateRequest,
  authorizeRoles(['admin','superAdmin']),
  practiceGames.deleteSubgame
)
router.get(
  "/play/game/:practiceGameId",
  authenticateRequest,
  practiceGames.playPracticeGame
)
router.post(
  "/game/finished/:practiceGameId",
  authenticateRequest,
  practiceGames.practiceGameFinished
)
export default router;
