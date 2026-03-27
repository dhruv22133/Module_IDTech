import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // FIX: Await the cookies() promise before calling delete()
  const cookieStore = await cookies();
  cookieStore.delete("session");
  
  return NextResponse.json({ success: true });
}