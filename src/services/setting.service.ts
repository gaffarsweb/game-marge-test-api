import {SettingRepository} from "../repositories/setting.repository";
import { ISettings } from "../models/setting.model";
import { CustomError } from "../utils/custom-error";
import { HTTP_STATUS } from "../utils/httpStatus";

export class SettingsService {

    constructor(private settingRepository: SettingRepository=new SettingRepository()){};
  async getSettings(): Promise<ISettings> {
    const setting= await this.settingRepository.getSettings();
    if(!setting)throw new CustomError("No settings found",HTTP_STATUS.NOT_FOUND);
    return setting;
  }
 
  async updateSettings(settings: Partial<ISettings>): Promise<ISettings | null> {
    return await this.settingRepository.updateSettings(settings);
  }
  async deleteSettings(): Promise<void> {
    await this.settingRepository.deleteSettings();
  }
  async createSettings(settings: ISettings): Promise<ISettings> {
    return await this.settingRepository.createSettings(settings);
  }
  async addOrUpdateLootConversion({ currency, rate, network }: { currency: string; rate: number, network:string }): Promise<ISettings["lootToCoinConversion"]> {
    const settings = await this.settingRepository.getSettings();
    if (!settings) throw new CustomError("Settings not found", HTTP_STATUS.NOT_FOUND);
    const index = settings.lootToCoinConversion.findIndex(item => item.currency === currency);
      
    if (index !== -1) {
      settings.lootToCoinConversion[index].rate = rate;
    } else {
      settings.lootToCoinConversion.push({ currency, rate, network });
    }
    await settings.save();
    return settings.lootToCoinConversion;
  }
 async removeLootConversionCurrency(currency:string):Promise<any>{
  
    const settings = await this.settingRepository.getSettings();
    if (!settings) throw new CustomError("Settings not found", HTTP_STATUS.NOT_FOUND);
    settings.lootToCoinConversion = settings.lootToCoinConversion.filter(item => item.currency !== currency);
    await settings.save();
  
    return settings.lootToCoinConversion;
  };
}

