import { Router } from 'express';
import promotionController from '../controllers/promotion.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authorizeRole';


const router = Router();

router.post("/create", authenticateRequest,authorizeRoles(['superAdmin','admin']),promotionController.createPromotions);
router.get("/",authenticateRequest, promotionController.getPromotions);
router.get("/:id", promotionController.getPromotionById);
router.delete("/:id",authenticateRequest,authorizeRoles(['superAdmin','admin']), promotionController.deletePromotion);
router.post("/update/:id",authenticateRequest,authorizeRoles(['superAdmin','admin']), promotionController.updatePromotion);
router.get("/get/unread-count", authenticateRequest,promotionController.getUnreadCount);
router.patch("/mark-all-as-read",authenticateRequest ,promotionController.markAllAsRead)

export default router;

