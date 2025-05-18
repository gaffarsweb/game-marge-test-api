import { Router } from 'express';
import messageController from '../controllers/chatmessage.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { idValidator} from '../middlewares/validations/chatmessage.validations';
import { validateRequest } from '../middlewares/validateRequest';
import { authorizeRoles } from '../middlewares/authorizeRole';

const router = Router();


router.get("/get-messages/:id", authenticateRequest, idValidator, validateRequest, messageController.getAllMessages);
router.get("/get-conversations", authenticateRequest,authorizeRoles(['superAdmin','admin']), messageController.getAllConversations);
router.get("/get-user-details/:id", authenticateRequest,authorizeRoles(['superAdmin','admin']), messageController.getUserDetails);


export default router;