import {Router} from 'express';
import spinController from '../controllers/spin.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authorizeRole';


const router=Router();


router.post("/create-spin-combination",authenticateRequest,authorizeRoles(['superAdmin','admin']),spinController.createSpinCombinations);
router.put("/update-spin-combination/:combinationId",authenticateRequest,authorizeRoles(['superAdmin','admin']),spinController.updateSpinCombinations);
router.post("/", authenticateRequest, spinController.spin);
router.post("/reward-user", authenticateRequest, spinController.rewardsUser);
router.get("/spin-history-admin",authenticateRequest,authorizeRoles(['admin','superAdmin']),spinController.getSpinHistory);
router.get("/spin-combinations", authenticateRequest,authorizeRoles(['admin','superAdmin']) ,spinController.getSpinCombinations);
router.get("/spin-combination/:combinationId",authenticateRequest,authorizeRoles(['admin','superAdmin']) ,spinController.getSpinCombination);
router.delete("/spin-combination/:combinationId",authenticateRequest,authorizeRoles(['superAdmin','admin']),spinController.deleteSpinCombinations);
router.get("/spin-fee", authenticateRequest, spinController.getSpinFee);





export default router;