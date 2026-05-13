import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_SOLO!]:     "solo",
  [process.env.STRIPE_PRICE_PRESTIGE!]: "prestige",
  [process.env.STRIPE_PRICE_AGENCE!]:   "agence",
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const clerk = await clerkClient();

  // ── Abonnement activé ──
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const priceId      = subscription.items.data[0]?.price.id;
    const plan         = PRICE_TO_PLAN[priceId] || "free";
    const userId       = subscription.metadata?.userId;

    if (userId) {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { plan },
      });
      console.log(`Plan mis à jour : ${userId} → ${plan}`);
    }
  }

  // ── Abonnement annulé ──
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId       = subscription.metadata?.userId;

    if (userId) {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { plan: "free" },
      });
      console.log(`Abonnement annulé : ${userId} → free`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}