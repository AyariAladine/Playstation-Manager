import { connect } from "../mongoose";
import { Game } from "../models/Game";

export async function listGames() {
  await connect();
  return Game.find().sort({ createdAt: -1 }).lean();
}

export async function getGame(id: string) {
  await connect();
  return Game.findById(id).lean();
}

export async function createGame(data: any) {
  await connect();
  const g = new Game(data);
  return g.save();
}

export async function updateGame(id: string, data: any) {
  await connect();
  return Game.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteGame(id: string) {
  await connect();
  return Game.findByIdAndDelete(id);
}
