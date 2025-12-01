import { NextResponse } from "next/server";
import { verifyCredentials } from "../../../../lib/services/authService";
import { createSession } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const user = await verifyCredentials(username, password);
    
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession(user._id.toString(), user.username);

    return NextResponse.json({ 
      success: true, 
      user: { id: user._id, username: user.username, name: user.name }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
