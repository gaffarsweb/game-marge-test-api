import express from 'express';
import * as securityController from '../controllers/security.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authorizeRole';

const router = express.Router();
//add ip
router.post('/', authenticateRequest,authorizeRoles(['superAdmin','admin']), securityController.AddSecurityIp);
//get whitelist ip for admin
router.get('/',authenticateRequest,authorizeRoles(['admin','superAdmin']), securityController.getWhitelistIp);
// check ip is white listed
router.get('/check', securityController.checkWhiteListIp);

export default router;