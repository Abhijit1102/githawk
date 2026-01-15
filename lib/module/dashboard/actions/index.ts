"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { graphql } from "@octokit/graphql";
import { Octokit } from "octokit";
import { getGithubToken, fetchUserContribution } from "../../github/lib/github";

/* =======================
   TYPES
======================= */

export interface DashboardStats {
  totalCommits: number;
  totalRepos: number;
  totalPRs: number;
  totalReviews: number;
}

interface DashboardStatsResponse {
  viewer: {
    repositories: { totalCount: number };
    pullRequests: { totalCount: number };
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestReviewContributions: number;
    };
  };
}

/* =======================
   DASHBOARD STATS
======================= */

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) throw new Error("Unauthorized");

    const token = await getGithubToken();

    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const data = await graphqlWithAuth<DashboardStatsResponse>(`
      query {
        viewer {
          repositories(affiliations: OWNER, isFork: false) {
            totalCount
          }
          pullRequests {
            totalCount
          }
          contributionsCollection {
            totalCommitContributions
            totalPullRequestReviewContributions
          }
        }
      }
    `);

    return {
      totalCommits:
        data.viewer.contributionsCollection.totalCommitContributions,
      totalRepos: data.viewer.repositories.totalCount,
      totalPRs: data.viewer.pullRequests.totalCount,
      totalReviews:
        data.viewer.contributionsCollection
          .totalPullRequestReviewContributions,
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      totalCommits: 0,
      totalRepos: 0,
      totalPRs: 0,
      totalReviews: 0,
    };
  }
}

/* =======================
   MONTHLY ACTIVITY
======================= */

interface MonthlyActivity {
  name: string;
  commits: number;
  prs: number;
  reviews: number;
}

export async function getMonthlyActivity(): Promise<MonthlyActivity[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) throw new Error("Unauthorized");

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const { data: user } = await octokit.rest.users.getAuthenticated();
    const calendar = await fetchUserContribution(token, user.login);

    if (!calendar) return [];

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthlyData: Record<string, MonthlyActivity> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyData[monthNames[d.getMonth()]] = {
        name: monthNames[d.getMonth()],
        commits: 0,
        prs: 0,
        reviews: 0,
      };
    }

    calendar.weeks.forEach((week) =>
      week.contributionDays.forEach((day) => {
        const d = new Date(day.date);
        const key = monthNames[d.getMonth()];
        if (monthlyData[key]) {
          monthlyData[key].commits += day.contributionCount;
        }
      })
    );

    const since = new Date();
    since.setMonth(since.getMonth() - 6);

    const { data: prs } =
      await octokit.rest.search.issuesAndPullRequests({
        q: `author:${user.login} type:pr created:>=${since.toISOString()}`,
        per_page: 100,
      });

    prs.items.forEach((pr) => {
      const d = new Date(pr.created_at);
      const key = monthNames[d.getMonth()];
      if (monthlyData[key]) monthlyData[key].prs++;
    });

    const { data: reviews } =
      await octokit.rest.search.issuesAndPullRequests({
        q: `reviewed-by:${user.login} type:pr created:>=${since.toISOString()}`,
        per_page: 100,
      });

    reviews.items.forEach((review) => {
      const d = new Date(review.created_at);
      const key = monthNames[d.getMonth()];
      if (monthlyData[key]) monthlyData[key].reviews++;
    });

    return Object.values(monthlyData);
  } catch (error) {
    console.error("Monthly activity error:", error);
    return [];
  }
}

/* =======================
   CONTRIBUTION STATS
======================= */

export interface ContributionStat {
  date: string;
  count: number;
  level: number;
}

export interface ContributionStatsResult {
  totalContributions: number;
  contributions: ContributionStat[];
}

export async function getContributionStats(): Promise<ContributionStatsResult | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) throw new Error("Unauthorized");

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const { data: user } = await octokit.rest.users.getAuthenticated();
    const calendar = await fetchUserContribution(token, user.login);

    if (!calendar) return null;

    return {
      totalContributions: calendar.totalContributions,
      contributions: calendar.weeks.flatMap((week) =>
        week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: Math.min(4, Math.floor(day.contributionCount / 3)),
        }))
      ),
    };
  } catch (error) {
    console.error("Contribution stats error:", error);
    return null;
  }
}
