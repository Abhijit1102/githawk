"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  MessageSquare,
} from "lucide-react";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  getDashboardStats,
  getMonthlyActivity,
} from "@/lib/module/dashboard/actions";
import { toast } from "sonner";

import ContributionGraph from "@/lib/module/dashboard/components/contribution-graph";

const MainPage = () => {
  const router = useRouter();

  /**
   * 🔐 AUTH SESSION (ALWAYS CALLED)
   */
  const { data: session, isPending } = useSession();

  /**
   * 📊 DATA QUERIES (ALWAYS CALLED — SAFE)
   */
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    enabled: !!session?.user,
    refetchOnWindowFocus: false,
  });

  const {
    data: monthlyActivity,
    isLoading: isLoadingActivity,
  } = useQuery({
    queryKey: ["monthly-activity"],
    queryFn: getMonthlyActivity,
    enabled: !!session?.user,
    refetchOnWindowFocus: false,
  });

  /**
   * 🔁 REDIRECT IF NOT AUTHENTICATED
   */
  useEffect(() => {
    if (!isPending && !session?.user) {
      toast.message("You need to signin !")
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
   * ✅ DASHBOARD UI
   */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your coding activity and AI reviews
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Total Repositories</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.totalRepos ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Total Commits</CardTitle>
            <GitCommit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : (stats?.totalCommits ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Pull Requests</CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.totalPRs ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">AI Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.totalReviews ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution Activity</CardTitle>
          <CardDescription>Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ContributionGraph />
        </CardContent>
      </Card>

      {/* Monthly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>AI Review Activity</CardTitle>
          <CardDescription>Monthly breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingActivity ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Loading activity...
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActivity ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="commits" fill="#3b82f6" />
                  <Bar dataKey="prs" fill="#8b5cf6" />
                  <Bar dataKey="reviews" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MainPage;
