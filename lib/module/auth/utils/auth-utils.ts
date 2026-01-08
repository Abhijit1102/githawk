"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  const incomingHeaders = await headers();

  const session = await auth.api.getSession({
    headers: new Headers(incomingHeaders),
  });

  if (!session) {
    redirect("/login");
  }

  return session;
};

export const requireUnAuth = async () => {
  const incomingHeaders = await headers();

  const session = await auth.api.getSession({
    headers: new Headers(incomingHeaders),
  });

  if (session) {
    redirect("/");
  }

  return session;
};
