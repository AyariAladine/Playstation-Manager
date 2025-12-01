import { NextResponse } from "next/server";
import { connect } from "../../../../../lib/mongoose";
import { PlayStation } from "../../../../../lib/models/PlayStation";
import { Game } from "../../../../../lib/models/Game";
import { Session } from "../../../../../lib/models/Session";
import { Player } from "../../../../../lib/models/Player";

function calcPrice(pricingType: string, priceValue: number, minutes: number) {
  if (pricingType === "perGame") return priceValue;
  // Add 2-minute grace period: only charge for intervals after 17:00, 32:00, etc.
  // Subtract 2 minutes before calculating intervals
  const adjustedMinutes = Math.max(0, minutes - 2);
  const intervals = Math.max(1, Math.ceil(adjustedMinutes / 15));
  return intervals * priceValue;
}

export async function POST(req: Request, { params }: any) {
  try {
    await connect();
    const resolvedParams = await params;
    const ps = await PlayStation.findById(resolvedParams.id).populate('currentGame currentPlayer');
    if (!ps) return NextResponse.json({ error: "PlayStation not found" }, { status: 404 });
    if (ps.status !== "occupied" || !ps.startTime) {
      return NextResponse.json({ error: "PlayStation is not occupied" }, { status: 400 });
    }
    const endTime = new Date();
    const startTime = ps.startTime instanceof Date ? ps.startTime : new Date(ps.startTime);
    const minutes = Math.max(1, Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60)));
    const game = await Game.findById(ps.currentGame);
    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    
    // Calculate price based on prepaid sessions or actual time (whichever is greater)
    let totalPrice;
    if (ps.prepaidSessions && ps.prepaidSessions > 1) {
      // Use prepaid sessions for pricing
      const prepaidPrice = game.pricingType === 'perGame' 
        ? game.priceValue * ps.prepaidSessions 
        : game.priceValue * ps.prepaidSessions;
      const calculatedPrice = calcPrice(game.pricingType, game.priceValue, minutes);
      // Charge whichever is greater (prepaid or actual time)
      totalPrice = Math.max(prepaidPrice, calculatedPrice);
    } else {
      totalPrice = calcPrice(game.pricingType, game.priceValue, minutes);
    }

    const session = new Session({
      playStation: ps._id,
      player: ps.currentPlayer,
      game: game._id,
      startTime,
      endTime,
      totalPrice,
    });
    await session.save();

    // Update player loyalty points
    if (ps.currentPlayer) {
      try {
        const playerId = ps.currentPlayer._id || ps.currentPlayer;
        console.log(`Updating loyalty for player ID: ${playerId}`);
        
        // Get current player to check if loyalty fields exist
        const currentPlayer = await Player.findById(playerId);
        
        if (currentPlayer) {
          // Initialize fields if they don't exist
          if (currentPlayer.loyaltyPoints === undefined) {
            currentPlayer.loyaltyPoints = 0;
          }
          if (currentPlayer.totalGamesPlayed === undefined) {
            currentPlayer.totalGamesPlayed = 0;
          }
          if (currentPlayer.rewardsEarned === undefined) {
            currentPlayer.rewardsEarned = 0;
          }
          
          // Increment loyalty
          currentPlayer.loyaltyPoints += 1;
          currentPlayer.totalGamesPlayed += 1;
          
          // Check if player earned a reward (every 10 games)
          if (currentPlayer.totalGamesPlayed % 10 === 0) {
            currentPlayer.rewardsEarned += 1;
            console.log(`🎁 Player earned a reward! Total rewards: ${currentPlayer.rewardsEarned}`);
          }
          
          const savedPlayer = await currentPlayer.save();
          
          console.log(`✅ Player loyalty updated: ${savedPlayer.totalGamesPlayed} games, ${savedPlayer.loyaltyPoints} points`);
          console.log(`Saved player data:`, JSON.stringify(savedPlayer.toObject(), null, 2));
        }
      } catch (loyaltyErr) {
        console.error('❌ Error updating loyalty:', loyaltyErr);
      }
    } else {
      console.log('⚠️ No current player found on PlayStation');
    }

    // clear playstation
    ps.currentPlayer = undefined;
    ps.currentGame = undefined;
    ps.startTime = undefined;
    ps.status = "available";
    await ps.save();

    return NextResponse.json(session);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
