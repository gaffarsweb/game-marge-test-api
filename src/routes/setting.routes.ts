import { Router } from "express";
import SettingsController from "../controllers/setting.controller";
import { createSettingsValidation, updateSettingValidation, validateCurrencyParam, validateLootConversion } from "../middlewares/validations/setting.validations";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();
 
router.get("/",authenticateRequest,authorizeRoles(['admin','superAdmin']), SettingsController.getSettings);
router.post("/", authenticateRequest,authorizeRoles(['superAdmin','admin']) ,SettingsController.createSettings);
router.put("/", authenticateRequest, authorizeRoles(['superAdmin','admin']),SettingsController.updateSettings);
router.delete("/", authenticateRequest,authorizeRoles(['superAdmin','admin']) ,SettingsController.deleteSettings);
// Add or update conversion
router.post(
    "/admin/settings/loot-conversion",
    authenticateRequest,
    authorizeRoles(['superAdmin','admin']),
    validateLootConversion,
    validateRequest,
    SettingsController.addOrUpdateLootConversion
  );
  
  // Remove conversion currency
  router.delete(
    "/admin/settings/loot-conversion/:currency",
    authenticateRequest,
    authorizeRoles(['superAdmin','admin']),
    validateCurrencyParam,
    validateRequest,
    SettingsController.removeLootConversionCurrency
  )

export default router; 