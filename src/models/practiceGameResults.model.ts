import mongoose from 'mongoose';

export interface InTransaction extends mongoose.Document {
    gameId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: 'game_play' | 'reward' | 'referral' | 'task' | 'admin_adjustment';
    description: string;
    title: string;
    imgUrl: string;
    score: number; // Positive or negative
    amount: number; // Positive or negative
    createdAt: Date;
    updatedAt: Date;
}

const practiceGameResults = new mongoose.Schema<InTransaction>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        gameId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Game' },
        score: { type: Number, required: true },
        amount: { type: Number, required: true },
    },
    { timestamps: true }
);

const PracticeGameResults = mongoose.model<InTransaction>(
    'PracticeGameResults',
    practiceGameResults
);

export default PracticeGameResults;
