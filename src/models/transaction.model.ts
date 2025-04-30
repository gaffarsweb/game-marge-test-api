import mongoose, { Schema, Document, Model } from "mongoose";
import { transactionType, transactionStatus } from "../utils/enums";

// Define the Transaction interface
interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  transactionAmount: number;
  transactionType: string;
  transactionStatus: string;
  currency?: string;
  network?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionAmount: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      enum: Object.values(transactionType),
      required: true,
    },
    transactionStatus: {
      type: String,
      enum: Object.values(transactionStatus),
      default: transactionStatus.PENDING,
    },
    currency: {
      type: String,
      required: false,
    },
    network: {
      type: String,
      required: false,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> = mongoose.model<ITransaction>("Transaction", TransactionSchema);
export default Transaction;
