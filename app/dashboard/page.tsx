"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, GitCommit, GitPullRequest, MessageSquare } from "lucide-react";
import {Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";
import {useQuery} from "@tanstack/react-query";
import { getDashboardStats, getMonthlyActivity } from "@/lib/module/dashboard/actions";
import ContributionGraph from "@/lib/module/dashboard/components/contribution-graph";

const MainPage = () => {

  const {data: stats, isLoading} = useQuery({
    queryKey:["dashboard-stats"],
    queryFn: async() => await getDashboardStats(),
    refetchOnWindowFocus:false
  });

  const {data: monthlyActivity, isLoading:isLoadingActivity} = useQuery({
    queryKey:["monthly-activity"],
    queryFn: async() => await getMonthlyActivity(),
    refetchOnWindowFocus:false
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your coding activity and AI reviews</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
      {/* Small cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
          <GitBranch className="h-4 w-4 text-muted-foreground"/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalRepos || 0}</div>
          <p className="text-xs text-muted-foreground">Connected repositories</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
          <GitCommit className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : (stats?.totalCommits || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">In the last year</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
          <GitPullRequest className="text-xs text-muted-foreground"/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalPRs || 0 }</div>
          <p className="text-sm text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Reviews</CardTitle>
          <GitPullRequest className="text-xs text-muted-foreground"/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalPRs || 0 }</div>
          <p className="text-sm text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      {/* Full width contribution card */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Contribution Activity</CardTitle>
          <CardDescription>Visualizing your coding frequency over last year</CardDescription>
        </CardHeader>
        <CardContent>
          <ContributionGraph />
         </CardContent>
      </Card>
    </div>  
   
    
     <div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>AI Review Activity</CardTitle>
          <CardDescription>Visualizing your AI Review frequency over last year</CardDescription>
        </CardHeader>
        <CardContent>
          {
            isLoadingActivity ? (
              <div className="h-80 w-full items-center justify-center">
                <div className="animation-pulse text-muted-foreground">Loading activity data...</div>
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width={"100%"} height={"100%"}>
                  <BarChart data={monthlyActivity || []}>
                    <CartesianGrid strokeDasharray="3.3" />
                     <XAxis dataKey="name"/>
                     <YAxis />
                     <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)'}}
                     itemStyle={{ color: 'var(--foreground)' }}
                     />
                     <Legend/>
                     <Bar dataKey="commits" name="Commit" fill="#3b82f6" radius={[4,4,0,0]} />
                     <Bar dataKey="prs" name="Pull Requests" fill="#8b52cf6" radius={[4,4,0,0]} />
                     <Bar dataKey="reviews" name="AI Reviews" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>
    </div>
  )
}

export default MainPage;