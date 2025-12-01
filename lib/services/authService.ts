import { connect } from "../mongoose";
import { User } from "../models/User";
import bcrypt from "bcryptjs";

export async function findUserByUsername(username: string) {
  await connect();
  return User.findOne({ username }).lean();
}

export async function createUser(data: { username: string; password: string; name: string }) {
  await connect();
  const user = new User(data);
  return user.save();
}

export async function listUsers() {
  await connect();
  return User.find().select("-password").lean();
}

export async function updateUser(id: string, data: any) {
  await connect();
  return User.findByIdAndUpdate(id, data, { new: true }).select("-password").lean();
}

export async function deleteUser(id: string) {
  await connect();
  return User.findByIdAndDelete(id);
}

export async function verifyCredentials(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user) return null;
  
  // Compare hashed password using bcrypt
  const isValid = await bcrypt.compare(password, user.password);
  if (isValid) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
}
