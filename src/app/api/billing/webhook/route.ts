import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const teamId = session.metadata?.teamId;
        
        if (teamId && session.subscription) {
          const subscriptionResponse = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subscription = subscriptionResponse as any;
          const periodEnd = subscription.current_period_end || subscription.currentPeriodEnd;

          await prisma.team.update({
            where: { id: teamId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items?.data?.[0]?.price?.id,
              stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
              plan: "pro",
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subscription = subscriptionResponse as any;
          const periodEnd = subscription.current_period_end || subscription.currentPeriodEnd;
          const team = await prisma.team.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
          });

          if (team && periodEnd) {
            await prisma.team.update({
              where: { id: team.id },
              data: {
                stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;
        const team = await prisma.team.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (team) {
          await prisma.team.update({
            where: { id: team.id },
            data: {
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
              plan: "free",
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
