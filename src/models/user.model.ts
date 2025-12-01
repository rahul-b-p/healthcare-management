import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../enums/role.enum";

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        const r = ret as any;
        if (r && r._id != null) {
          r.id = typeof r._id === "string" ? r._id : r._id.toString();
        }
        delete r._id;
        delete r.passwordHash;
        delete r.__v;
        return r;
      },
    },
  }
);

const User = mongoose.model<IUser>("users", userSchema);

export default User;
