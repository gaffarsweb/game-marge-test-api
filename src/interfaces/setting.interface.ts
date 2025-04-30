import { Bonus, ISettings } from "../models/setting.model";


export interface ISettingRepository{
    getSettings(): Promise<ISettings | null>;
    updateSettings(settings: IUpdateSettings): Promise<ISettings>;
    createSettings(settings: ISettings): Promise<ISettings>;
    deleteSettings(): Promise<void>;
}

export interface IUpdateSettings{
    signup_bonus?: Bonus;
    referral_bonus?: Bonus;
}