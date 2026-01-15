import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";

import {
  polar,
  checkout,
  usage,
  webhooks,
} from "@polar-sh/better-auth";

import { polarClient } from "@/lib/module/payment/config/polar";
import {
  updateUserTier,
  updatePolarCustomerId,
} from "@/lib/module/payment/lib/subscription";

const {
  GITHUB_AUTH_CLIENT_ID,
  GITHUB_AUTH_CLIENT_SECRET,
  NEXT_PUBLIC_APP_BASE_URL,
  POLAR_WEBHOOK_SECRET,
} = process.env;

if (!GITHUB_AUTH_CLIENT_ID) {
  throw new Error("❌ Missing GITHUB_AUTH_CLIENT_ID");
}
if (!GITHUB_AUTH_CLIENT_SECRET) {
  throw new Error("❌ Missing GITHUB_AUTH_CLIENT_SECRET");
}
if (!NEXT_PUBLIC_APP_BASE_URL) {
  throw new Error("❌ Missing NEXT_PUBLIC_APP_BASE_URL");
}
if (!POLAR_WEBHOOK_SECRET) {
  throw new Error("❌ Missing POLAR_WEBHOOK_SECRET");
}


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  socialProviders: {
    github: {
      clientId: GITHUB_AUTH_CLIENT_ID ?? "Ov23liXFabJYx3XKlh58",
      clientSecret: GITHUB_AUTH_CLIENT_SECRET ?? "8ddb7e9553e7604b2c9a5445e47dba0394723cab",
      scope: ["read:user", "repo", "admin:repo_hook"],
    },
  },

  // ✅ THIS FIXES INVALID_ORIGIN
  trustedOrigins: [
    "https://githawk.vercel.app",
    NEXT_PUBLIC_APP_BASE_URL!,
  ].filter(Boolean),

  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,

      returnUrl:
        NEXT_PUBLIC_APP_BASE_URL ??
        "https://githawk.vercel.app/dashboard",

      use: [
        checkout({
          products: [
            {
              productId: "885b431a-adb4-4e9b-902b-826eb9051234",
              slug: "githawk",
            },
          ],
          successUrl:
            process.env.POLAR_SUCCESS_URL ??
            "/dashboard/subscription?success=true",
          authenticatedUsersOnly: true,
        }),

        usage(),

        webhooks({
          secret: POLAR_WEBHOOK_SECRET!,

          onSubscriptionActive: async (payload) => {
            const user = await prisma.user.findUnique({
              where: { polarCustomerId: payload.data.customerId },
            });

            if (user) {
              await updateUserTier(
                user.id,
                "PRO",
                "ACTIVE",
                payload.data.id
              );
            }
          },

          onSubscriptionCanceled: async (payload) => {
            const user = await prisma.user.findUnique({
              where: { polarCustomerId: payload.data.customerId },
            });

            if (user) {
              await updateUserTier(
                user.id,
                user.subscriptionTier as any,
                "CANCELED"
              );
            }
          },

          onSubscriptionRevoked: async (payload) => {
            const user = await prisma.user.findUnique({
              where: { polarCustomerId: payload.data.customerId },
            });

            if (user) {
              await updateUserTier(user.id, "FREE", "EXPIRED");
            }
          },

          onCustomerCreated: async (payload) => {
            const user = await prisma.user.findUnique({
              where: { email: payload.data.email },
            });

            if (user) {
              await updatePolarCustomerId(user.id, payload.data.id);
            }
          },
        }),
      ],
    }),
  ],
});
