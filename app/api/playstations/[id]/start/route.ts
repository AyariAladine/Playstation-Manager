import { NextResponse } from "next/server";
import { connect } from "../../../../../lib/mongoose";
import { PlayStation } from "../../../../../lib/models/PlayStation";

export async function POST(req: Request, { params }: any) {
  try {
    await connect();
    const { playerId, gameId, prepaidSessions } = await req.json();
    const resolvedParams = await params;
    const ps = await PlayStation.findById(resolvedParams.id);
    if (!ps) return NextResponse.json({ error: "PlayStation not found" }, { status: 404 });
    if (ps.status === "occupied") return NextResponse.json({ error: "Already occupied" }, { status: 400 });
    ps.currentPlayer = playerId;
    ps.currentGame = gameId;
    ps.startTime = new Date();
    ps.status = "occupied";
    ps.prepaidSessions = prepaidSessions || 1;
    await ps.save();
    return NextResponse.json(ps);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
