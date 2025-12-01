import { connect } from "../mongoose";
import { Player } from "../models/Player";

export async function listPlayers() {
  await connect();
  return Player.find().sort({ createdAt: -1 }).lean();
}

export async function getPlayer(id: string) {
  await connect();
  return Player.findById(id).lean();
}

export async function createPlayer(data: any) {
  await connect();
  const p = new Player(data);
  return p.save();
}

export async function updatePlayer(id: string, data: any) {
  await connect();
  return Player.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deletePlayer(id: string) {
  await connect();
  return Player.findByIdAndDelete(id);
}
