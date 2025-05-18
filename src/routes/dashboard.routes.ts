import express from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { validateActiveUsersQuery, validateTotalUsersQuery } from '../middlewares/validations/dashboard.validations';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authorizeRole';

const router = express.Router();

router.get('/',authenticateRequest,dashboardController.getdashboard);
router.get('/admin/',authenticateRequest,authorizeRoles(['admin','superAdmin']), dashboardController.getdashboard);
router.post('/admin/create-update',authenticateRequest,authorizeRoles(['superAdmin','admin']) ,dashboardController.upsertdashboard);
router.delete('/admin/dashboard',authenticateRequest,authorizeRoles(['superAdmin','admin']) ,dashboardController.deletedashboard);
router.get("/bots/stats",authenticateRequest,authorizeRoles(['admin','superAdmin']),dashboardController.getBotStats);
router.get("/users/stats",authenticateRequest,authorizeRoles(['admin','superAdmin']),dashboardController.getUserStats);
router.get("/matches/stats",authenticateRequest,authorizeRoles(['admin','superAdmin']),dashboardController.getMatchStats);
router.get("/games/stats",authenticateRequest,authorizeRoles(['admin','superAdmin']),dashboardController.getGameStats);
router.get("/active-users",authenticateRequest,authorizeRoles(['admin','superAdmin']),validateActiveUsersQuery,validateRequest,dashboardController.getActiveUsers);
router.get("/total-users",authenticateRequest,authorizeRoles(['admin','superAdmin']),validateTotalUsersQuery,validateRequest,dashboardController.getTotalUsersByDate);

export default router;