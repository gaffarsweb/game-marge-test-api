import { Router } from 'express';
import promotionController from '../controllers/promotion.controller';


const router = Router();

router.post("/create", promotionController.createPromotions);
router.get("/", promotionController.getPromotions);
router.get("/:id", promotionController.getPromotionById);
router.delete("/:id", promotionController.deletePromotion);
router.post("/update/:id", promotionController.updatePromotion);

export default router;

