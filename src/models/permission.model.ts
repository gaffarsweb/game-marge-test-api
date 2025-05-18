import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Access object where key is a permission type and value is a boolean
 * Example: { read: true, create: false, delete: true, updatePopup: true }
 */
interface IAccess {
  [key: string]: boolean;
}

interface IPermission extends Document {
  permissions: {
    module: string;
    selectAll: boolean;
    access: IAccess;
  }[];
  allPermission: boolean;
  userId: Types.ObjectId;
}

const AccessSchema: Schema = new Schema(
  {},
  {
    _id: false,
    strict: false, // Allows any key-value pairs (e.g., read, delete, createBanner)
  }
);

const PermissionSchema: Schema<IPermission> = new Schema(
  {
    permissions: [
      {
        module: { type: String, required: true },
        selectAll: { type: Boolean, default: false },
        access: { type: AccessSchema, required: true },
      },
    ],
    allPermission: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Optional: adds createdAt and updatedAt
  }
);

export default mongoose.model<IPermission>("Permissions", PermissionSchema);
