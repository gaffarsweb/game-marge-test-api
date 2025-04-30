import { Router } from 'express';
import messageController from '../controllers/chatmessage.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { idValidator, sendMessageValidator } from '../middlewares/validations/chatmessage.validations';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();


router.get("/get-users-admin", authenticateRequest, messageController.getUsersWhoHasMessaged);
router.get("/get-messages/:id", authenticateRequest, idValidator, validateRequest, messageController.getAllMessages);
router.post("/send", authenticateRequest, sendMessageValidator, validateRequest, messageController.sendMessage);


export default router;