"use server";

import { auth } from "@/lib/auth";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  const reqHeaders = getHeaders();

  const session = await auth.api.getSession({
    headers: await reqHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  return session;
};

export const requireUnAuth = async () => {
  const reqHeaders = getHeaders();

  const session = await auth.api.getSession({
    headers: await reqHeaders,
  });

  if (session) {
    redirect("/");
  }

  return null;
};
