import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL &&
  process.env.NEXT_PUBLIC_APP_BASE_URL.trim() !== ""
    ? process.env.NEXT_PUBLIC_APP_BASE_URL
    : "https://githawk.vercel.app";

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  customer,
  checkout,
} = createAuthClient({
  baseURL: BASE_URL,
  plugins: [polarClient()],
});
