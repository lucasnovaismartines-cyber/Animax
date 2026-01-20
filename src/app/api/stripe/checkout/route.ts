import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { cookies } from "next/headers";
import { findUserByEmail } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(req: Request) {
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

    const priceId = env.STRIPE_PRICE_PREMIUM_ID;
    
    // env.ts guarantees existence, so no need for if (!priceId) check unless we want to keep it for logic flow
    
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${env.NEXT_PUBLIC_APP_URL}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/assinaturas?canceled=true`,
      metadata: {
        userId: user.id,
      },
      customer_email: user.email,
    });

    return NextResponse.redirect(checkoutSession.url!, 303);
  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
