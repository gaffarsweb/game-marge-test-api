import { ISettingRepository } from "../interfaces/setting.interface";
import Setting,{ ISettings } from "../models/setting.model";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";


export class SettingRepository implements ISettingRepository{
    async getSettings(): Promise<ISettings | null> {
        return await Setting.findOne();
      }
    
      async updateSettings(settings: Partial<ISettings>): Promise<ISettings> {
        const updatedSettings= await Setting.findOneAndUpdate({}, settings, { new: true, upsert: true });
        if(!updatedSettings)throw new CustomError("Settings not found",HTTP_STATUS.NOT_FOUND);
        return updatedSettings;
      }
      async deleteSettings(): Promise<void> {
        await Setting.deleteOne();
      }
    
      async createSettings(settings: ISettings): Promise<ISettings> {
        return await Setting.findOneAndUpdate(
          {}, // Match condition: customize this if there's a unique identifier
          { $set: settings },
          { upsert: true, new: true }
        );
      }
    
} 