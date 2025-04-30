import {Router} from 'express';
import spinController from '../controllers/spin.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';


const router=Router();


router.post("/create-spin-combination",authenticateRequest,spinController.createSpinCombinations);
router.put("/update-spin-combination/:combinationId", authenticateRequest, spinController.updateSpinCombinations);
router.post("/", authenticateRequest, spinController.spin);
router.post("/reward-user", authenticateRequest, spinController.rewardsUser);
router.get("/spin-history-admin", authenticateRequest, spinController.getSpinHistory);
router.get("/spin-combinations", authenticateRequest, spinController.getSpinCombinations);
router.get("/spin-combination/:combinationId", authenticateRequest, spinController.getSpinCombination);
router.delete("/spin-combination/:combinationId", authenticateRequest, spinController.deleteSpinCombinations);
router.get("/spin-fee", authenticateRequest, spinController.getSpinFee);





export default router;