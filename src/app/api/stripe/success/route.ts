import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { cookies } from "next/headers";
import { findUserByEmail, updateUserByEmail } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/assinaturas", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(new URL("/assinaturas?error=payment_failed", request.url));
    }

    const customerEmail = session.customer_details?.email || session.customer_email;

    if (!customerEmail) {
      return NextResponse.redirect(new URL("/assinaturas?error=no_email", request.url));
    }

    const user = await findUserByEmail(customerEmail);

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const now = new Date();
    const ends = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await updateUserByEmail(user.email, {
      plan: "premium",
      lastPaymentAt: now.toISOString(),
      subscriptionStartedAt: now.toISOString(),
      subscriptionEndsAt: ends.toISOString(),
      subscriptionPrice: 10,
      lastSubscriptionStatus: "active",
      lastPaymentMethod: "card",
    });

    const cookieStore = await cookies();
    cookieStore.set("user_plan", "premium", { path: "/" });

    return NextResponse.redirect(new URL("/assinaturas?success=true", request.url));
  } catch (error) {
    console.error("[STRIPE_SUCCESS_ERROR]", error);
    return NextResponse.redirect(new URL("/assinaturas?error=verification_failed", request.url));
  }
}
