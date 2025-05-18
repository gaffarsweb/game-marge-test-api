import express from 'express';
import gamergeController from '../controllers/gamergeCoinConfiguration.controller';
import { addGamergeConfigurationValidation, getUserGamergeCoinsValidation, buyGamergeTokens } from '../middlewares/validations/gamergeCoinConfiguration.validations';
import { validateRequest } from '../middlewares/validateRequest';
import { authorizeRoles } from '../middlewares/authorizeRole';
import { authenticateRequest } from '../middlewares/authMiddleware';

const router = express.Router();

router.put('/add-gamerge-configuration',authenticateRequest,authorizeRoles(['admin','superAdmin']), addGamergeConfigurationValidation, validateRequest, gamergeController.addGamergeConfiguration);
router.get('/get-gamerge-configuration',authenticateRequest,  gamergeController.getGamergeConfiguration);
router.get('/get-user-balance/:userId', getUserGamergeCoinsValidation, validateRequest, gamergeController.getUserPossibleCoinsDetails);
router.post('/buy-coins/:userId',buyGamergeTokens , validateRequest, gamergeController.buyGamergeTokens);

export default router;