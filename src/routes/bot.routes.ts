import { Router } from "express";
import botController from "../controllers/bot.controller";
import {
  createBotValidation,
  paramBotIdValidation,
  updateBotValidation,
} from "../middlewares/validations/bot.validations";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.post(
  "/",
  authenticateRequest,
  authorizeRoles(["superAdmin",'admin']),
  createBotValidation,
  validateRequest,
  botController.createBot
);
router.get(
  "/",
  authenticateRequest,
  authorizeRoles(["admin", "superAdmin"]),
  botController.getAllBots
);
router.get(
  "/:botId",
  authenticateRequest,
  paramBotIdValidation,
  validateRequest,
  botController.getBotById
);
router.delete(
  "/:botId",
  authenticateRequest,
  authorizeRoles(['superAdmin','admin']),
  paramBotIdValidation,
  validateRequest,
  botController.deleteBot
);
router.put(
  "/:botId",
  authenticateRequest,
  authorizeRoles(['superAdmin','admin']),
  updateBotValidation,
  validateRequest,
  botController.updateBot
);

export default router;
