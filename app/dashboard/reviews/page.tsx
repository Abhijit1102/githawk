"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { getReviews } from "@/lib/module/review/actions";
import { formatDistanceToNow } from "date-fns";
import Loader from "@/components/Loader";
import { toast } from "sonner";

export default function ReviewsPage() {
  const router = useRouter();

  /**
   * 🔐 AUTH SESSION (ALWAYS CALLED)
   */
  const { data: session, isPending } = useSession();

  /**
   * 📊 REVIEWS QUERY (SAFE — ENABLED ONLY IF AUTHENTICATED)
   */
  const {
    data: reviews = [],
    isLoading,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: getReviews,
    enabled: !!session?.user,
    refetchOnWindowFocus: false,
  });

  /**
   * 🔁 REDIRECT IF NOT AUTHENTICATED
   */
  useEffect(() => {
    if (!isPending && !session?.user) {
      toast.message("You need to login!")
      router.replace("/");
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
   * ⏳ DATA LOADING
   */
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-9 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  /**
   * ✅ PAGE UI
   */
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review History</h1>
        <p className="text-muted-foreground">
          View all A.I. code reviews.
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="py-12 text-center text-muted-foreground">
              No review yet. Connect a repository and open a PR to get AI reviews.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review: any) => (
            <Card
              key={review.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">
                        {review.prTitle}
                      </CardTitle>

                      {review.status === "completed" && (
                        <Badge className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}

                      {review.status === "failed" && (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Failed
                        </Badge>
                      )}

                      {review.status === "pending" && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    <CardDescription>
                      {review.repository.fullName} · PR #{review.prNumber}
                    </CardDescription>
                  </div>

                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={review.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-xs">
                    {review.review.substring(0, 300)}...
                  </pre>
                </div>

                <Button variant="outline" asChild>
                  <a
                    href={review.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Full Review on GitHub
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
