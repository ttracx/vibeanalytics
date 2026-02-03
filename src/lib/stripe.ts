import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    events: 10000,
    projects: 1,
    members: 1,
  },
  pro: {
    name: "Pro",
    price: 24,
    priceId: "", // Will be set after creating product
    events: 1000000,
    projects: 10,
    members: 5,
  },
};
