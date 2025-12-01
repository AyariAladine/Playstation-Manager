import { NextResponse } from "next/server";
import { listPlayStations, createPlayStation } from "../../../lib/services/playstationService";

export async function GET() {
  try {
    const items = await listPlayStations();
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createPlayStation(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
