import { Router } from "express";
import subgameController from "../controllers/subgame.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";
import {
  createSubGameValidation,
  subgameIdValidaton,
  updateSubGameValidation,
  validateGetSubgamesForApp,
} from "../middlewares/validations/subgame.validations";
import { validateRequest } from "../middlewares/validateRequest";
import { gameIdValidaton } from "../middlewares/validations/game.validations";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.post(
  "/",
  authenticateRequest,
  authorizeRoles(['superAdmin','admin']),
  createSubGameValidation,
  validateRequest,
  subgameController.createNewSubgame
);

router.get(
  "/game/:gameId",
  authenticateRequest,
  gameIdValidaton,
  validateRequest,
  subgameController.getAllSubgamesByGameId
);
router.get(
  "/",
 
  validateGetSubgamesForApp,
  validateRequest,
  subgameController.getAllSubgamesForApp
);

router.get(
  "/:subgameId",
  subgameIdValidaton,
  validateRequest,
  subgameController.getSubgame
);

router.put(
  "/:subgameId",
  authenticateRequest,
  authorizeRoles(['superAdmin','admin']),
  updateSubGameValidation,
  validateRequest,
  subgameController.updateSubgame
)

router.delete(
  "/:subgameId",
  authenticateRequest,
  authorizeRoles(['superAdmin','admin']),
  subgameIdValidaton,
  validateRequest,
  subgameController.deleteSubgame
)
export default router;
