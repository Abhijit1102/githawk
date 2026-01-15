import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { updateUserTier, updatePolarCustomerId} from "@/lib/module/payment/lib/subscription";
import { polarClient } from "./module/payment/config/polar";
import {
  polar,
  checkout,
  usage,
  webhooks,
} from "@polar-sh/better-auth";

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
  
  trustedOrigins:[
    process.env.NEXT_PUBLIC_APP_BASE_URL
  ].filter(Boolean) as string[],

  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      returnUrl:
        process.env.NEXT_PUBLIC_APP_BASE_URL ??
        "http://localhost:3000/dashboard",

      use: [
        checkout({
          products: [
            {
              productId: "885b431a-adb4-4e9b-902b-826eb9051234",
              slug: "githawk",
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL || "/dashboard/subscription?success=true",
          authenticatedUsersOnly: true,
        }),

        usage(),

        webhooks({
          secret: "polar_whs_GS8IIfxpWVaYGd8ICkiPQScvHBu41ytAXbL8O06jdhV",
          onSubscriptionActive: async (payload) => {
            const customerId = payload.data.customerId;

            const user  = await prisma.user.findUnique({
              where: {
                polarCustomerId:customerId
              }
            });

            if(user){
              await updateUserTier(user.id, "PRO", "ACTIVE", payload.data.id);
            }
          },
          onSubscriptionCanceled: async (payload) => {
            const customerId = payload.data.customerId;

            const user  = await prisma.user.findUnique({
              where: {
                polarCustomerId:customerId
              }
            });

            if(user){
              await updateUserTier(user.id, user.subscriptionTier as any, "CANCELED");  
            }
          },
          onSubscriptionRevoked: async (payload) => {
            const customerId = payload.data.customerId;

            const user  = await prisma.user.findUnique({
              where: {
                polarCustomerId:customerId
              }
            });

            if(user){
              await updateUserTier(user.id, "FREE", "EXPIRED");
            }
          },
          onOrderPaid: async (event) => { },
          onCustomerCreated: async (payload) => {
            const user = await prisma.user.findUnique({
              where: {
                email: payload.data.email
              }
            });

            if(user){
              await updatePolarCustomerId(user.id, payload.data.id)
            }
          },
        }),
      ],
    }),
  ],
});
