import { connect } from "../mongoose";
import { Session } from "../models/Session";
import { PlayStation } from "../models/PlayStation";
import { Game } from "../models/Game";
import { Player } from "../models/Player";

export async function listSessions(filter: any = {}) {
  await connect();
  return Session.find(filter).sort({ endTime: -1 }).populate('playStation player game').lean();
}

export async function getSession(id: string) {
  await connect();
  return Session.findById(id).populate('playStation player game').lean();
}

export async function createSession(data: any) {
  await connect();
  const s = new Session(data);
  // mark playstation as available if session ended elsewhere after creation
  return s.save();
}

export async function endSession(sessionId: string, endTime: Date, totalPrice: number) {
  await connect();
  const session = await Session.findByIdAndUpdate(sessionId, { endTime, totalPrice }, { new: true }).lean();
  
  // Update player loyalty points
  if (session && session.player) {
    await Player.findByIdAndUpdate(session.player, {
      $inc: { 
        totalGamesPlayed: 1,
        loyaltyPoints: 1
      }
    });
    
    // Check if player earned a reward (every 10 games)
    const player = await Player.findById(session.player).lean();
    if (player && player.totalGamesPlayed % 10 === 0) {
      await Player.findByIdAndUpdate(session.player, {
        $inc: { rewardsEarned: 1 }
      });
    }
  }
  
  return session;
}
