import express from 'express';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { createNetwork, getNetworks , updateNetworks} from '../controllers/networks.controller';
import { authorizeRoles } from '../middlewares/authorizeRole';

const router = express.Router();

router.post('/create-network', authenticateRequest,authorizeRoles(['superAdmin']), createNetwork);

router.get('/get-networks', authenticateRequest,authorizeRoles(['superAdmin']), getNetworks);

router.post('/update-network', authenticateRequest,authorizeRoles(['superAdmin']), updateNetworks);


export default router;


