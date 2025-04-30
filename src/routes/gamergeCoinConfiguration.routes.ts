import express from 'express';
import gamergeController from '../controllers/gamergeCoinConfiguration.controller';
import { addGamergeConfigurationValidation, getUserGamergeCoinsValidation, buyGamergeTokens } from '../middlewares/validations/gamergeCoinConfiguration.validations';
import { validateRequest } from '../middlewares/validateRequest';

const router = express.Router();

router.put('/add-gamerge-configuration', addGamergeConfigurationValidation, validateRequest, gamergeController.addGamergeConfiguration);
router.get('/get-gamerge-configuration',  gamergeController.getGamergeConfiguration);
router.get('/get-user-balance/:userId', getUserGamergeCoinsValidation, validateRequest, gamergeController.getUserPossibleCoinsDetails);
router.post('/buy-coins/:userId',buyGamergeTokens , validateRequest, gamergeController.buyGamergeTokens);

export default router;