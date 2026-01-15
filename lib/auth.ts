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

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_AUTH_CLIENT_ID!,
      clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET!,
      scope: ["read:user", "repo", "admin:repo_hook"],
    },
  },

  // ✅ THIS FIXES INVALID_ORIGIN
  trustedOrigins: [
    "https://githawk.vercel.app",
    process.env.NEXT_PUBLIC_APP_BASE_URL!,
  ].filter(Boolean),

  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,

      returnUrl:
        process.env.NEXT_PUBLIC_APP_BASE_URL ??
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
          secret: process.env.POLAR_WEBHOOK_SECRET!,

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
