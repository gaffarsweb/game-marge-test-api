import { Router } from "express";
import practiceGames from "../controllers/practiceGame.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { gameIdValidaton } from "../middlewares/validations/game.validations";

const router = Router();

router.post(
  "/",
  authenticateRequest,
  practiceGames.createNewPracticeGame
);

router.get(
  "/game/:gameId",


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
  practiceGames.updateSubgame
)

router.delete(
  "/:practiceGameId",
  authenticateRequest,
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
