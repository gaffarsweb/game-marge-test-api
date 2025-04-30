import { Request, Response } from "express";
import {SettingsService} from "../services/setting.service";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResponse";
import { CustomError } from "../utils/custom-error";
import { logger } from "../utils/logger";
import { HTTP_STATUS } from "../utils/httpStatus";

class SettingsController {

    constructor(private settingsService:SettingsService=new SettingsService()){};

   getSettings=async(req: Request, res: Response):Promise<any>=>{
    logger.info("Get settings endpoint hit.");
    try {
      const settings = await this.settingsService.getSettings(); 
      return sendSuccessResponse(res,"Ok",settings);
    } catch (error:any) {
      logger.error(`Error retrieving settings: error: ${error}`);
      if(error instanceof CustomError){
        return sendErrorResponse(res,error,error.message,error.statusCode);
      }
      return sendErrorResponse(res,error,error.message || "Error retrieving settings");
    }
  }

   updateSettings=async(req: Request, res: Response):Promise<any>=> {
    logger.info("Update settings endpoint hit.");
    try {
      const updatedSettings = await this.settingsService.updateSettings(req.body);
      return sendSuccessResponse(res,"Setting updated successfully.",updatedSettings);
    } catch (error:any) {
        logger.error(`Error updating settings: error: ${error}`);
        if(error instanceof CustomError){
          return sendErrorResponse(res,error,error.message,error.statusCode);
        }
        return sendErrorResponse(res,error,error.message || "Error updating settings");
    }
  }

   createSettings=async(req: Request, res: Response):Promise<any>=> {
    logger.info("Create setting endpoint hit.");
    try {

      const newSettings = await this.settingsService.createSettings(req.body);
      return sendSuccessResponse(res, "Setting created successfully.", newSettings,HTTP_STATUS.CREATED);
    } catch (error:any) {
      return sendErrorResponse(res,error,error.message || 'Error creating settings');
    }
  }
   deleteSettings=async(req: Request, res: Response):Promise<any>=> {
    logger.info("Delete settings endpoint hit.");
    try {
      await this.settingsService.deleteSettings();
      return sendSuccessResponse(res, "Setting deleted successfully.");
    } catch (error:any) {
      logger.error(`Error deleting settings: error: ${error}`);
      if(error instanceof CustomError){
        return sendErrorResponse(res,error,error.message,error.statusCode);
      }
      return sendErrorResponse(res,error,error.message || "Error deleting settings");
    }
   }

    addOrUpdateLootConversion=async(req: Request, res: Response):Promise<any>=> {
      logger.info("Add or update loot conversion endpoint hit.");
      try {
        const { currency, rate, network } = req.body;
        const lootConversion = await this.settingsService.addOrUpdateLootConversion({ currency, rate, network });
        return sendSuccessResponse(res, "Loot conversion updated successfully.", lootConversion);
      } catch (error:any) {
        logger.error(`Error adding/updating loot conversion: error: ${error}`);
        if(error instanceof CustomError){
          return sendErrorResponse(res,error,error.message,error.statusCode);
        }
        return sendErrorResponse(res,error,error.message || "Error adding/updating loot conversion");
      }
    }

    removeLootConversionCurrency=async(req: Request, res: Response):Promise<any>=> {
      logger.info("Remove loot conversion currency endpoint hit.");
      try {
        const { currency } = req.params;
        const lootConversion = await this.settingsService.removeLootConversionCurrency(currency);
        return sendSuccessResponse(res, "Loot conversion currency removed successfully.", lootConversion);
      } catch (error:any) {
        logger.error(`Error removing loot conversion currency: error: ${error}`);
        if(error instanceof CustomError){
          return sendErrorResponse(res,error,error.message,error.statusCode);
        }
        return sendErrorResponse(res,error,error.message || "Error removing loot conversion currency");
      }
    }
}

export default new SettingsController();
