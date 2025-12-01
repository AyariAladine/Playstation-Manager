import { NextResponse } from "next/server";
import { getPlayer, updatePlayer, deletePlayer } from "../../../../lib/services/playerService";

export async function GET(_req: Request, { params }: any) {
  try {
    const resolvedParams = await params;
    const player = await getPlayer(resolvedParams.id);
    if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(player);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: any) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const updated = await updatePlayer(resolvedParams.id, body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: any) {
  try {
    const resolvedParams = await params;
    await deletePlayer(resolvedParams.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
