import { Schema, Document, model } from 'mongoose';
import { referralBonusType } from '../utils/enums';

export interface Bonus {
  currency: string;
  amount: number;
  network:string;
  referralBonusType: string
}
export interface borningCoins {
  currency: string;
  parentage: number;
  network:string;
}

export interface DefaultImage {
  imgUrl: string;
  name: string;
}

export interface ISettings extends Document {
  signup_bonus: Bonus;
  signup_bonus_loot_coin: number;
  referral_bonus: Bonus;
  referral_bonus_loot_coin: number;
  win_deduction_percentage: number;
  win_coin_percentage_burn: borningCoins;
  player1_referrer_percentage: number;
  spinFee: number;
  spinLimit: number;
  botWaitingTime: number;
  botResultWaitingTime:number,
  player2_referrer_percentage: number;
  updatedAt: Date;
  practiceGameLimit: number;
  
  lootToCoinConversion: {
    currency: string;
    rate: number;
    network:string;
  }[];
  defaultImgs: DefaultImage[];
}

const BonusSchema = new Schema<Bonus>({
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  network:{type:String, required:false},
  referralBonusType: {
    type: String,
    enum: Object.values(referralBonusType), 
    required: true
  }
}, { _id: false });
const borningCoinsSchema = new Schema<borningCoins>({
  currency: { type: String, required: true },
  parentage: { type: Number, required: true },
  network:{type:String, required:false},
}, { _id: false });

const DefaultImageSchema = new Schema<DefaultImage>({
  imgUrl: { type: String, required: true },
  name: { type: String, required: true },
  
}, { _id: false });

const SettingsSchema = new Schema<ISettings>({
  signup_bonus: { type: BonusSchema, required: true },
  signup_bonus_loot_coin: { type: Number, required: true },
  referral_bonus: { type: BonusSchema, required: true },
  referral_bonus_loot_coin: { type: Number, required: true },
  win_deduction_percentage: { type: Number, default: 10 },
  win_coin_percentage_burn: { type: borningCoinsSchema },
  player1_referrer_percentage: { type: Number, default: 2.5 },
  player2_referrer_percentage: { type: Number, default: 2.5 },
  updatedAt: { type: Date, default: Date.now },
  practiceGameLimit: { type: Number, default: 5 },
  spinFee: { type: Number, default: 100 },
  spinLimit: { type: Number, default: 10 },
  botWaitingTime: { type: Number,required:true, default: 10 },
  botResultWaitingTime:{type:Number,required:true,default:10},
  lootToCoinConversion: [
    {
      _id: false,
      currency: { type: String, required: true },
      network: { type: String, required: true },
      rate: { type: Number, required: true },
    },
  ],
  defaultImgs: { type: [DefaultImageSchema], default: [] }
});

const Settings = model<ISettings>("Settings", SettingsSchema);
export default Settings;
