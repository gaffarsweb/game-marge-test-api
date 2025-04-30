import {Router } from 'express';
import BurnEventController from '../controllers/burnevent.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { validateBurinEventId, validateBurnEvent, validateBurnEventUpdate } from '../middlewares/validations/burnevent.validations';
import { validateRequest } from '../middlewares/validateRequest';


const router = Router();


router.get('/history', authenticateRequest, BurnEventController.getBurnCoinHistory);
router.get('/', authenticateRequest,BurnEventController.getBurnEvent);
router.get('/:id', authenticateRequest,validateBurinEventId,validateRequest,BurnEventController.getBurnEventById);
router.post('/', authenticateRequest,validateBurnEvent,validateRequest,BurnEventController.createBurnEvent);  
router.put('/:id', authenticateRequest,validateBurnEventUpdate,validateRequest,BurnEventController.updateBurnEvent);
router.delete('/:id', authenticateRequest,validateBurinEventId,validateRequest,BurnEventController.deleteBurnEvent);
router.post('/trigger/:id', authenticateRequest,validateBurinEventId,validateRequest,BurnEventController.triggerBurnEvent);



export default router;