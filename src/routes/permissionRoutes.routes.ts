import express from 'express';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { addUpdatePermission, getPermissions } from '../controllers/permission.controller';
import { authorizeRoles } from '../middlewares/authorizeRole';

const router = express.Router();

router.post('/add-update-permission', authenticateRequest,authorizeRoles(['superAdmin','admin']), addUpdatePermission);

router.get('/get-permission/:userId', authenticateRequest,authorizeRoles(['admin','superAdmin']), getPermissions);


export default router;


