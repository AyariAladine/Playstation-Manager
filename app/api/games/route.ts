import { NextResponse } from "next/server";
import { listGames, createGame } from "../../../lib/services/gameService";

export async function GET() {
  try {
    const games = await listGames();
    return NextResponse.json(games);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createGame(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
