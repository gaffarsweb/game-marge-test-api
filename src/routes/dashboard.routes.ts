import express from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { validateActiveUsersQuery, validateTotalUsersQuery } from '../middlewares/validations/dashboard.validations';
import { validateRequest } from '../middlewares/validateRequest';

const router = express.Router();

router.get('/', dashboardController.getdashboard);
router.get('/admin/', dashboardController.getdashboard);
router.post('/admin/create-update', dashboardController.upsertdashboard);
router.delete('/admin/dashboard', dashboardController.deletedashboard);
router.get("/bots/stats",dashboardController.getBotStats);
router.get("/users/stats",dashboardController.getUserStats);
router.get("/matches/stats",dashboardController.getMatchStats);
router.get("/games/stats",dashboardController.getGameStats);
router.get("/active-users",validateActiveUsersQuery,validateRequest,dashboardController.getActiveUsers);
router.get("/total-users",validateTotalUsersQuery,validateRequest,dashboardController.getTotalUsersByDate);

export default router;