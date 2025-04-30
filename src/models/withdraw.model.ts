import mongoose, { Schema, Document, Model } from "mongoose";

// Define the Withdraw interface
interface IWithdraw extends Document {
  userId: mongoose.Types.ObjectId;
  withdrawAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  withdrawToAddress?: string;
  currency: string;
  network: string;
  otpExpiredAt: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  verifiedRequest: boolean;
  OTP: number;
}

const withdrawSchema: Schema<IWithdraw> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    withdrawAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    withdrawToAddress: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    otpExpiredAt: {
      type: String,
      required: true,
    },
    verifiedRequest: {
      type: Boolean,
      required: false,
    },
    OTP: {
      type: Number,
      required: false,
    },
    remark: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Withdraw: Model<IWithdraw> = mongoose.model<IWithdraw>("Withdraw", withdrawSchema);
export default Withdraw;
