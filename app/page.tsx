"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import LandingPage from "@/components/LandingPage";
import Loader from "@/components/Loader";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Redirect if authenticated
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [isPending, session, router]);

  /**
   * 🎨 CARTOON LOADER (only while checking auth)
   */
  if (isPending) {
    return <Loader />
  }

  // Already redirected above
  if (session?.user) return null;

  return <LandingPage />;
}
