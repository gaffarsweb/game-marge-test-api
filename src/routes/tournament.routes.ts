import { Router } from "express";
import tournamentController from "../controllers/tournament.controller";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { validateCreateTournament, validateUpdateTournament, validateGetTournaments, validateGetTournamentById, validateDeleteTournament, validateGetTournamentsDetailsForAdmin, getTournamentParticipationsValidation } from "../middlewares/validations/tournament.validations";
import { validateRequest } from "../middlewares/validateRequest";


const router = Router();

// Admin Apis
router.post("/", authenticateRequest, validateCreateTournament, validateRequest, tournamentController.createTournament);
router.put("/:id", authenticateRequest, validateUpdateTournament, validateRequest, tournamentController.updateTournament);
router.get("/admin/tournaments", authenticateRequest, tournamentController.getAllTournaments);
router.delete("/:id", authenticateRequest, validateDeleteTournament, validateRequest, tournamentController.deleteTournament);
router.get("/admin/tournament/:id/details", authenticateRequest,validateGetTournamentsDetailsForAdmin,validateRequest, tournamentController.getTournamentDetailsForAdmin);
router.get("/participations/:id", authenticateRequest, getTournamentParticipationsValidation, validateRequest, tournamentController.getTournamentParticipations);
router.get("/get-for-dropdown-admin", authenticateRequest, tournamentController.getTournamentWithoutPage);

// User Apis
router.get("/", authenticateRequest, validateGetTournaments, validateRequest, tournamentController.getAllTournamentsForApp);
router.get("/:id/details", authenticateRequest, validateGetTournamentById, validateRequest, tournamentController.getTournamentDetailsById);
router.get("/:id", authenticateRequest, validateGetTournamentById, validateRequest, tournamentController.getTournamentById);


export default router;