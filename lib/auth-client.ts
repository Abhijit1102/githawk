import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  customer,
  checkout,
} = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_BASE_URL!,
  plugins: [polarClient()],
});
