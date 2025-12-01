import mongoose from "../mongoose";

const { Schema, models, model } = mongoose as any;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);

export type UserType = {
  _id: string;
  username: string;
  password: string;
  name: string;
};
