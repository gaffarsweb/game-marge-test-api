import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  firstName: string;
  lastName?:string
  email: string;
  password?: string;
  country: string;
  avatarUrl: string;
  provider: string;
  refreshToken: string;
  referralCode: string; // Unique code for each user
  referredBy?: string; // Stores the referral code of the referrer
  totalReferrals: number; // Count of successful referrals
  earnedCoins: number; // Coins earned from referrals

  isEmailVerified: boolean;
  isActive: boolean;
  role: "user" | "admin" | "superAdmin";
  otp?: string;
  otpExpiredAt?: Date;
  playedPracticeGame?: Number;
  currentSpinCount: number
  totalUSD?: number
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String,trim: true , default:""},
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String },
    country: { type: String, trim: true },
    avatarUrl: { type: String, trim: true, default: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" },
    provider: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    referralCode: { type: String, unique: true },
    referredBy: { type: String, default: null },
    totalReferrals: { type: Number, default: 0 },
    earnedCoins: { type: Number, default: 0 },
    otp: { type: String, minLength: 6 },
    otpExpiredAt: { type: Date },
    refreshToken: { type: String },
    role: { type: String, enum: ["user", "admin", "superAdmin"], default: "user" },
    isActive: { type: Boolean, default: true },
    playedPracticeGame: { type: Number, default: 0 },
    currentSpinCount: { type: Number, default: 0 },
    totalUSD: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
