import express from 'express';
import * as depositController from '../controllers/deposit.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', authenticateRequest, depositController.getAllDeposits); 
export default router;