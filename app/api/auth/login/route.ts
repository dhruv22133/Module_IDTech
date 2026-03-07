import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const [rows]: any = await pool.execute(
    "SELECT * FROM users WHERE email = ?", [email]
  );

  if (!rows.length)
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const valid = await bcrypt.compare(password, rows[0].password);
  if (!valid)
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  return NextResponse.json({ success: true, user: { name: rows[0].first_name, role: rows[0].role } });
}