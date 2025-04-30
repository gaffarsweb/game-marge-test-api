import mongoose, { Schema, Document } from 'mongoose';

export interface IGamergeCoinConfiguration extends Document {
    description: string;
    network: string;
    currency: string;
    ratePerGamerge: number;
    maxGamergeCoins: number;
    totalSupply: number;
    currencyImg: string;
}

const GamergeCoinConfigurationSchema = new Schema<IGamergeCoinConfiguration>(
    {
        description: { type: String, required: true },
        network: { type: String, required: true },
        currency: { type: String, required: true },
        ratePerGamerge: { type: Number, required: true },
        maxGamergeCoins: { type: Number, required: true },
        totalSupply: { type: Number, default: 0 },
        currencyImg: { type: String, required: false },
    },
    { timestamps: true }
);

export default mongoose.model<IGamergeCoinConfiguration>(
    'GamergeCoinConfiguration',
    GamergeCoinConfigurationSchema
);
