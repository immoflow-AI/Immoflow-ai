import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { auth } from "@clerk/nextjs/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(_req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
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
