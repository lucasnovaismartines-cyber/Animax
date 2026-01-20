import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByEmail, updateUserByEmail } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get("user_email")?.value;

    if (!email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json().catch(() => null) as
      | { paymentIntentId?: string }
      | null;

    if (!body?.paymentIntentId) {
      return new NextResponse("Missing paymentIntentId", { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      body.paymentIntentId
    );

    if (
      paymentIntent.status !== "succeeded" ||
      paymentIntent.metadata?.userId !== user.id
    ) {
      return new NextResponse("Payment not valid for this user", {
        status: 400,
      });
    }

    const now = new Date();
    const ends = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updated =
      (await updateUserByEmail(user.email, {
        plan: "premium",
        lastPaymentAt: now.toISOString(),
        subscriptionStartedAt: now.toISOString(),
        subscriptionEndsAt: ends.toISOString(),
        subscriptionPrice: 10,
      })) ?? user;

    cookieStore.set("user_plan", updated.plan, { path: "/" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[STRIPE_ACTIVATE_PRO_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

