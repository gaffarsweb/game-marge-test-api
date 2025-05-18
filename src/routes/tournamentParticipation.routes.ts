import {Router} from 'express';
import tournamentParticipationController from '../controllers/tournamentParticipation.controller';
import { authenticateRequest } from '../middlewares/authMiddleware';
import { validateCreateParticipation, validateUpdateParticapation } from '../middlewares/validations/tournamentParticipation.validations';
import { validateRequest } from '../middlewares/validateRequest';


const router=Router();

router.post('/join',authenticateRequest,validateCreateParticipation,validateRequest,tournamentParticipationController.joinTournament);
router.get('/:tournamentId',authenticateRequest,tournamentParticipationController.getParticipationByTournamentId);
router.get('/user/:userId', authenticateRequest, tournamentParticipationController.getParticipationByUserId);
router.put('/:participationId',authenticateRequest,validateUpdateParticapation,validateRequest, tournamentParticipationController.updateParticipation);



export default router;