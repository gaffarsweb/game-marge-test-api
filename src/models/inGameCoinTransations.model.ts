import mongoose from 'mongoose';

export interface InTransaction extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    // type: 'game_play' | 'reward' | 'referral' | 'task' | 'admin_adjustment' | 'spin_fee' | 'spin_reward';
    type: 'CREDITED' | 'DEBITED';
    description: string;
    title: string;
    imgUrl: string;
    amount: number; // Positive or negative
    createdAt: Date;
    updatedAt: Date;
}

const InGameCoinTransactionsSchema = new mongoose.Schema<InTransaction>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        type: {
            type: String,
            required: true,
            // enum: ['game_entry_fee','winner_reward', 'reward', 'referral', 'task', 'admin_adjustment','spin_fee','spin_reward'],
            enum: ['CREDITED','DEBITED'],
        },
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        imgUrl:{type:String,},
        title:{type:String,},
    },
    { timestamps: true }
);

const InGameCoinTransactions = mongoose.model<InTransaction>(
    'InGameCoinTransactions',
    InGameCoinTransactionsSchema
);

export default InGameCoinTransactions;
