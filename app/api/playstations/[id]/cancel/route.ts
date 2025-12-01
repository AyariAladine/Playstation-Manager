import { NextResponse } from "next/server";
import { connect } from "../../../../../lib/mongoose";
import { PlayStation } from "../../../../../lib/models/PlayStation";

export async function POST(req: Request, { params }: any) {
  try {
    await connect();
    const resolvedParams = await params;
    const ps = await PlayStation.findById(resolvedParams.id);
    
    if (!ps) {
      return NextResponse.json({ error: "PlayStation not found" }, { status: 404 });
    }
    
    if (ps.status !== "occupied") {
      return NextResponse.json({ error: "PlayStation is not occupied" }, { status: 400 });
    }

    // Simply clear the console without creating a session or charging
    ps.currentPlayer = undefined;
    ps.currentGame = undefined;
    ps.startTime = undefined;
    ps.prepaidSessions = 1;
    ps.status = "available";
    await ps.save();

    return NextResponse.json({ 
      success: true, 
      message: "Session cancelled without charges" 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
