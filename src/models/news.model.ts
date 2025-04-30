import mongoose from 'mongoose';

export interface INews extends mongoose.Document {
    title: string;
    description: string;
    imgUrl: string;
    createdAt: Date; // Add createdAt and updatedAt
    updatedAt: Date; // Add updatedAt
    createdAtRelative: string;
    isActive: boolean;
    seekedBy: string[];
}

const NewsSchema = new mongoose.Schema<INews>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        imgUrl: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        seekedBy: { type: [String], default: [] },
    },
    { timestamps: true } // This automatically adds createdAt and updatedAt
);

const News = mongoose.model<INews>('News', NewsSchema);

export default News;
