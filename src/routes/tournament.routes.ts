import { Router } from "express";
import tournamentController from "../controllers/tournament.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { validateCreateTournament, validateUpdateTournament, validateGetTournaments, validateGetTournamentById, validateDeleteTournament, validateGetTournamentsDetailsForAdmin, getTournamentParticipationsValidation } from "../middlewares/validations/tournament.validations";
import { validateRequest } from "../middlewares/validateRequest";
import { authorizeRoles } from "../middlewares/authorizeRole";


const router = Router();

// Admin Apis
router.post("/", authenticateRequest,authorizeRoles(['superAdmin','admin']) ,validateCreateTournament, validateRequest, tournamentController.createTournament);
router.put("/:id", authenticateRequest,authorizeRoles(['superAdmin','admin']) ,validateUpdateTournament, validateRequest, tournamentController.updateTournament);
router.get("/admin/tournaments", authenticateRequest,authorizeRoles(['admin','superAdmin']) ,tournamentController.getAllTournaments);
router.delete("/:id", authenticateRequest,authorizeRoles(['superAdmin','admin']) ,validateDeleteTournament, validateRequest, tournamentController.deleteTournament);
router.get("/admin/tournament/:id/details", authenticateRequest,validateGetTournamentsDetailsForAdmin,validateRequest, tournamentController.getTournamentDetailsForAdmin);
router.get("/participations/:id", authenticateRequest, getTournamentParticipationsValidation, validateRequest, tournamentController.getTournamentParticipations);
router.get("/get-for-dropdown-admin", authenticateRequest,authorizeRoles(['admin','superAdmin']) ,tournamentController.getTournamentWithoutPage);
router.get("/get-tournaments/:gameId", authenticateRequest, tournamentController.getTournamentsByGameId);
router.get("/admin/tournament/:id/details-rank", authenticateRequest,authorizeRoles(['admin','superAdmin']),validateGetTournamentById,validateRequest, tournamentController.getTournamentDetailsAdminById);

// User Apis
router.get("/", authenticateRequest, validateGetTournaments, validateRequest, tournamentController.getAllTournamentsForApp);
router.get("/:id/details", authenticateRequest, validateGetTournamentById, validateRequest, tournamentController.getTournamentDetailsById);
router.get("/:id", authenticateRequest, validateGetTournamentById, validateRequest, tournamentController.getTournamentById);


export default router;