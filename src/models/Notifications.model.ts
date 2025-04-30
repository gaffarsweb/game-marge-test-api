import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
    title: string;
    description: string;
    imgUrl: string;
    isActive: boolean;
    seekedBy: string[];
    createdAt: Date; 
    updatedAt: Date; 
}
const NotificationsSchema = new mongoose.Schema<INotification>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imgUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    seekedBy: { type: [String], default: [] }
},
{ timestamps: true });

const Notifications = mongoose.model<INotification>('Notifications', NotificationsSchema);

export default Notifications;
