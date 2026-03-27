import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    if (!rawText) return NextResponse.json({ error: "Empty request body" }, { status: 400 });

    const { email, password } = JSON.parse(rawText);
    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

    const [rows]: any = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (!rows || !rows.length) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const userData = { id: rows[0].id, name: rows[0].first_name, role: rows[0].role };

    // FIX: Await the cookies() promise before calling set()
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify(userData), {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 60 * 60 * 24 * 7, 
      path: "/", 
    });

    return NextResponse.json({ success: true, user: userData });

  } catch (error: any) {
    return NextResponse.json({ error: "Server parsing error." }, { status: 500 });
  }
}