import { destroySASession } from "@/lib/superadmin-session";
import { NextResponse } from "next/server";

export async function POST() {
  await destroySASession();
  return NextResponse.json({ ok: true });
}
