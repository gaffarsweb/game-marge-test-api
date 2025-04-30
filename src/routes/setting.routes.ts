import { Router } from "express";
import SettingsController from "../controllers/setting.controller";
import { createSettingsValidation, updateSettingValidation, validateCurrencyParam, validateLootConversion } from "../middlewares/validations/setting.validations";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticateRequest } from "../middlewares/authMiddleware";

const router = Router();
 
router.get("/", SettingsController.getSettings);
router.post("/", authenticateRequest, SettingsController.createSettings);
router.put("/", authenticateRequest, SettingsController.updateSettings);
router.delete("/", authenticateRequest, SettingsController.deleteSettings);
// Add or update conversion
router.post(
    "/admin/settings/loot-conversion",
    authenticateRequest,
    validateLootConversion,
    validateRequest,
    SettingsController.addOrUpdateLootConversion
  );
  
  // Remove conversion currency
  router.delete(
    "/admin/settings/loot-conversion/:currency",
    authenticateRequest,
    validateCurrencyParam,
    validateRequest,
    SettingsController.removeLootConversionCurrency
  )

export default router; 