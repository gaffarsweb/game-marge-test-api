import mongoose, { Schema, Document } from 'mongoose';

export interface IActiveUser extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date; 
  createdAt: Date;
  updatedAt: Date;
}

const ActiveUserSchema = new Schema<IActiveUser>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true, 
    },
  },
  {
    timestamps: true,
  }
);


ActiveUserSchema.index({ date: 1 });
ActiveUserSchema.index({ userId: 1 });
ActiveUserSchema.index({ date: 1, userId: 1 });


 const ActiveUser = mongoose.model<IActiveUser>('ActiveUser', ActiveUserSchema);
export default ActiveUser;