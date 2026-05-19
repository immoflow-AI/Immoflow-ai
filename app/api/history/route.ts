import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId requis." }, { status: 400 });
  }

  const raw = await redis.lrange(`history:${userId}`, 0, 29);
  const entries = raw.map(item => {
    try {
      return typeof item === "string" ? JSON.parse(item) : item;
    } catch {
      return null;
    }
  }).filter(Boolean);

  return NextResponse.json({ entries }, { status: 200 });
}
