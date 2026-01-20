import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByEmail } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST() {
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: "brl",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("[STRIPE_CREATE_INTENT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

