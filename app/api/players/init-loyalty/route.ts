import { NextResponse } from "next/server";
import { connect } from "../../../../lib/mongoose";
import { Player } from "../../../../lib/models/Player";

export async function POST() {
  try {
    await connect();
    
    // Update all players to have loyalty fields
    const result = await Player.updateMany(
      {},
      {
        $set: {
          loyaltyPoints: 0,
          totalGamesPlayed: 0,
          rewardsEarned: 0
        }
      }
    );

    const players = await Player.find().lean();

    return NextResponse.json({
      message: "Loyalty fields initialized",
      modifiedCount: result.modifiedCount,
      players: players.map((p: any) => ({
        name: p.name,
        loyaltyPoints: p.loyaltyPoints,
        totalGamesPlayed: p.totalGamesPlayed,
        rewardsEarned: p.rewardsEarned
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
