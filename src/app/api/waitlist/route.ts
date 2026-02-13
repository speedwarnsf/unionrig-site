import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const WAITLIST_FILE = path.join(process.cwd(), "waitlist.json");

async function readWaitlist(): Promise<{ emails: { email: string; ts: string }[] }> {
  try {
    const data = await fs.readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { emails: [] };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const waitlist = await readWaitlist();

    if (waitlist.emails.some((e) => e.email === normalized)) {
      return NextResponse.json({ ok: true, message: "Already on the list." });
    }

    waitlist.emails.push({ email: normalized, ts: new Date().toISOString() });

    await fs.writeFile(WAITLIST_FILE, JSON.stringify(waitlist, null, 2));
    console.log(`[waitlist] ${normalized} added at ${new Date().toISOString()}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] Error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
