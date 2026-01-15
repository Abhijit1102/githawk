import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";

export const authClient = createAuthClient({
    baseURL:process.env.BETTER_AUTH_URL
})

export const { signIn, signUp, useSession, signOut, customer, checkout} = createAuthClient({
    basePath: process.env.BETTER_AUTH_URL,
    plugins:[polarClient()]
})
