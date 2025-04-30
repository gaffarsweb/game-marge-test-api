import { Router } from "express";
import leaderboardController from "../controllers/leaderboard.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";

const router = Router();

router.get(
  "/get-by-game/:id",
  authenticateRequest,
  leaderboardController.getLeaderBoardByGameId
);

 
export default router;
