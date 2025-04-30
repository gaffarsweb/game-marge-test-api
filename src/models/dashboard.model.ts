import mongoose, { Schema, Document } from 'mongoose';

interface IBanner {
    imgUrl: string;
    title: string;
    link: string;
    type: string;
    details?: Record<string, any>;
}

interface IPopup {
    imgUrl: string;
    title: string;
    description: string;
    link: string;
    btnText: string;
}

export interface Idashboard extends Document {
    banner: IBanner[];
    popup: IPopup;
}

const dashboardSchema: Schema = new Schema({
    banner: [{
        imgUrl: { type: String, required: true },
        title: { type: String, required: true },
        link: { type: String, required: true },
        type: { type: String, require: false }
    }],
    popup: {
        imgUrl: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        link: { type: String, required: true },
        btnText: { type: String, required: true }
    }
}, { timestamps: true });

export default mongoose.model<Idashboard>('dashboard', dashboardSchema);
