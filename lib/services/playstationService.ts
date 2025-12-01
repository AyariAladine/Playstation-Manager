import { connect } from "../mongoose";
import { PlayStation } from "../models/PlayStation";

export async function listPlayStations() {
  await connect();
  return PlayStation.find().sort({ createdAt: -1 }).populate('currentPlayer currentGame').lean();
}

export async function getPlayStation(id: string) {
  await connect();
  return PlayStation.findById(id).populate('currentPlayer currentGame').lean();
}

export async function createPlayStation(data: any) {
  await connect();
  const p = new PlayStation(data);
  return p.save();
}

export async function updatePlayStation(id: string, data: any) {
  await connect();
  return PlayStation.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deletePlayStation(id: string) {
  await connect();
  return PlayStation.findByIdAndDelete(id);
}
