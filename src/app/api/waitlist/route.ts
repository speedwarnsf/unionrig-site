import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const WAITLIST_FILE = path.join(process.cwd(), "waitlist.json");
const SEED_COUNT = 847;

interface WaitlistEntry {
  email: string;
  ts: string;
  referralCode: string;
  referredBy?: string;
}

interface WaitlistData {
  emails: WaitlistEntry[];
}

async function readWaitlist(): Promise<WaitlistData> {
  try {
    const data = await fs.readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { emails: [] };
  }
}

function generateReferralCode(): string {
  return "UR-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function GET() {
  const waitlist = await readWaitlist();
  return NextResponse.json({
    count: waitlist.emails.length + SEED_COUNT,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, ref } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(normalized)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const waitlist = await readWaitlist();

    // Check for existing signup
    const existing = waitlist.emails.find((e) => e.email === normalized);
    if (existing) {
      return NextResponse.json({
        ok: true,
        message: "Already on the list.",
        referralCode: existing.referralCode,
      });
    }

    // Validate referral code if provided
    let referredBy: string | undefined;
    if (ref && typeof ref === "string") {
      const referrer = waitlist.emails.find((e) => e.referralCode === ref);
      if (referrer) {
        referredBy = ref;
      }
    }

    const referralCode = generateReferralCode();

    waitlist.emails.push({
      email: normalized,
      ts: new Date().toISOString(),
      referralCode,
      ...(referredBy ? { referredBy } : {}),
    });

    await fs.writeFile(WAITLIST_FILE, JSON.stringify(waitlist, null, 2));

    return NextResponse.json({
      ok: true,
      referralCode,
      position: waitlist.emails.length + SEED_COUNT,
    });
  } catch (err) {
    console.error("[waitlist] Error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
