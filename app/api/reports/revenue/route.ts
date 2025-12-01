import { NextResponse } from "next/server";
import { connect } from "../../../../lib/mongoose";
import { Session } from "../../../../lib/models/Session";

export async function GET(req: Request) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let query: any = {};
    
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.endTime = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      query.endTime = { $gte: startDate, $lte: endDate };
    }

    const sessions = await Session.find(query)
      .populate("playStation player game")
      .sort({ endTime: -1 })
      .lean();

    // Calculate daily revenue
    const dailyRevenue: { [key: string]: number } = {};
    const monthlyRevenue: { [key: string]: number } = {};
    const gameRevenue: { [key: string]: { title: string; revenue: number; sessions: number } } = {};

    sessions.forEach((session: any) => {
      const date = new Date(session.endTime);
      const dayKey = date.toISOString().split("T")[0];
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      dailyRevenue[dayKey] = (dailyRevenue[dayKey] || 0) + session.totalPrice;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + session.totalPrice;

      // Track game revenue
      const gameTitle = session.game?.title || "Unknown";
      if (!gameRevenue[gameTitle]) {
        gameRevenue[gameTitle] = { title: gameTitle, revenue: 0, sessions: 0 };
      }
      gameRevenue[gameTitle].revenue += session.totalPrice;
      gameRevenue[gameTitle].sessions += 1;
    });

    // Get top 20 selling games
    const topGames = Object.values(gameRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20);

    return NextResponse.json({
      sessions,
      dailyRevenue,
      monthlyRevenue,
      totalRevenue: sessions.reduce((sum: number, s: any) => sum + s.totalPrice, 0),
      topGames,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
