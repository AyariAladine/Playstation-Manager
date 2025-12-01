import { NextResponse } from "next/server";
import { listPlayers, createPlayer } from "../../../lib/services/playerService";

export async function GET() {
  try {
    const players = await listPlayers();
    return NextResponse.json(players);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createPlayer(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
