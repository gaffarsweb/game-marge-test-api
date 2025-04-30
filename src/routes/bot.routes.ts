import {Router} from 'express';
import botController from '../controllers/bot.controller';
import { createBotValidation, paramBotIdValidation, updateBotValidation } from '../middlewares/validations/bot.validations';
import { validateRequest } from '../middlewares/validateRequest';


const router=Router();

router.post("/",createBotValidation,validateRequest,botController.createBot);
router.get("/",botController.getAllBots);
router.get("/:botId",paramBotIdValidation,validateRequest,botController.getBotById); 
router.delete("/:botId",paramBotIdValidation,validateRequest,botController.deleteBot);
router.put("/:botId",updateBotValidation,validateRequest,botController.updateBot);


export default router;

