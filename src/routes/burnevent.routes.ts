import {Router } from 'express';
import BurnEventController from '../controllers/burnevent.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { validateBurinEventId, validateBurnEvent, validateBurnEventUpdate } from '../middlewares/validations/burnevent.validations';
import { validateRequest } from '../middlewares/validateRequest';
import { authorizeRoles } from '../middlewares/authorizeRole';


const router = Router();


router.get('/history', authenticateRequest,authorizeRoles(['admin','superAdmin']), BurnEventController.getBurnCoinHistory);
router.get('/', authenticateRequest,BurnEventController.getBurnEvent);
router.get('/:id', authenticateRequest,validateBurinEventId,validateRequest,BurnEventController.getBurnEventById);
router.post('/', authenticateRequest,authorizeRoles(['superAdmin','admin']),validateBurnEvent,validateRequest,BurnEventController.createBurnEvent);  
router.put('/:id', authenticateRequest,authorizeRoles(['superAdmin','admin']),validateBurnEventUpdate,validateRequest,BurnEventController.updateBurnEvent);
router.delete('/:id', authenticateRequest,authorizeRoles(['superAdmin','admin']),validateBurinEventId,validateRequest,BurnEventController.deleteBurnEvent);
router.post('/trigger/:id', authenticateRequest,authorizeRoles(['superAdmin','admin']),validateBurinEventId,validateRequest,BurnEventController.triggerBurnEvent);



export default router;