import { NextResponse } from "next/server";
import { getGame, updateGame, deleteGame } from "../../../../lib/services/gameService";

export async function GET(_req: Request, { params }: any) {
  try {
    const game = await getGame(params.id);
    if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(game);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: any) {
  try {
    const body = await req.json();
    const updated = await updateGame(params.id, body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: any) {
  try {
    await deleteGame(params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
