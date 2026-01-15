import { Suspense } from "react";
import SubscriptionClient from "@/lib/module/subscription/components/SubscriptionClient";
import { Spinner } from "@/components/ui/spinner";

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><Spinner /></div>}>
      <SubscriptionClient />
    </Suspense>
  );
}
