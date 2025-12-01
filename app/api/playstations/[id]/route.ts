import { NextResponse } from "next/server";
import { getPlayStation, updatePlayStation, deletePlayStation } from "../../../../lib/services/playstationService";

export async function GET(_req: Request, { params }: any) {
  try {
    const item = await getPlayStation(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: any) {
  try {
    const body = await req.json();
    const updated = await updatePlayStation(params.id, body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: any) {
  try {
    await deletePlayStation(params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
