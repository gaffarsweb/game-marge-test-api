import mongoose, { Schema, Document } from "mongoose";

interface IBalance {
  balance: number;
  availableBalance: number;
  currency: string;
  network:string;
  image?: string;
}

interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  address: string;
  privateKey: string;
  mnemonic: string;
  balances: IBalance[];
  createdAt: Date;
  updatedAt: Date;
}


const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    address: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
      select: false, // Hiding privateKey in default queries for security
    },
    mnemonic: {
      type: String,
      required: true,
      select: false, // Hiding mnemonic in default queries
    },
    balances: [
      {
        _id: false, 
        balance: {
          type: Number,
          required: true,
          default: 0,
        },
        availableBalance: {
          type: Number,
          required: true,
          default: 0,
        },
        currency: {
          type: String,
          required: true,
        },
        network: {
          type: String,
          required: true,
          default:null,
        },
        image: {
          type: String,
          default:null,
        },
      }
    ],
    
  },
  { timestamps: true }
);


const Wallet = mongoose.model<IWallet>("Wallet", WalletSchema);
export default Wallet;
