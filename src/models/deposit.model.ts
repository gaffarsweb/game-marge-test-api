import mongoose, { Schema, Document } from "mongoose";

// Define the TypeScript interface for the document
export interface IDeposit extends Document {
  userId: mongoose.Types.ObjectId;
  timeStamp: number;
  blockNumber: number;
  transactionHash: string;
  from: string;
  to: string;
  tokenSymbol: string;
  network: string;
  amount: number;
  txreceipt_status?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose schema
const depositSchema = new Schema<IDeposit>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timeStamp: {
      type: Number,
      required: true,
    },
    blockNumber: {
      type: Number,
      required: true,
    },
    transactionHash: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    tokenSymbol: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    txreceipt_status: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
const Deposit = mongoose.model<IDeposit>("Deposit", depositSchema);
export default Deposit;
