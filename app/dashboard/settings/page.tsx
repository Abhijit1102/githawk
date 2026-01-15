"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

import { ProfileForm } from "@/lib/module/settings/components/profile-form";
import { RepositoryList } from "@/lib/module/settings/components/repository-list";
import Loader from "@/components/Loader";
import { toast } from "sonner";

const SettingsPage = () => {
  const router = useRouter();

  /**
   * 🔐 AUTH SESSION (ALWAYS CALLED)
   */
  const { data: session, isPending } = useSession();

  /**
   * 🔁 REDIRECT IF NOT AUTHENTICATED
   */
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/");
      toast.message("You need to Login!")
    }
  }, [isPending, session, router]);

  /**
   * ⏳ WAIT FOR AUTH CHECK
   */
  if (isPending) {
    return (
      <Loader />
    );
  }

  /**
   * 🚫 BLOCK UI UNTIL REDIRECT
   */
  if (!session?.user) {
    return null;
  }

  /**
   * ✅ SETTINGS PAGE UI
   */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and connected repository
        </p>
      </div>

      <ProfileForm />
      <RepositoryList />
    </div>
  );
};

export default SettingsPage;
