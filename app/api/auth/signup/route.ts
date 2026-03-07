import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, company, role, password } = await req.json();

  const hash = await bcrypt.hash(password, 12);

  try {
    await pool.execute(
      "INSERT INTO users (first_name, last_name, email, company, role, password) VALUES (?,?,?,?,?,?)",
      [firstName, lastName, email, company, role, hash]
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY")
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}