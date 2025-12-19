"use server";

import { auth } from "@/lib/auth";
import { fetchUserContribution, getGithubToken } from "../../github/lib/github";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import { preconnect } from "react-dom";
import { date } from "better-auth";

/* -------------------- DASHBOARD STATS -------------------- */

export async function getDashboardStats() {
 try {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // GitHub token
  const token = await getGithubToken();

  const octokit = new Octokit({
    auth: token,
  });

  // Get GitHub username
  const { data: user } = await octokit.rest.users.getAuthenticated();

  // Fetch GitHub contributions
  const calendar = await fetchUserContribution(token, user.login);

  const totalCommits = calendar.totalContributions || 0;

  // Example placeholder (replace with DB value)
  const totalRepos = 30;

  const {data:prs} = await octokit.rest.search.issuesAndPullRequests({
    q:`author:${user.login} type pr`,
    per_page:1
  })

  const totalPRs = prs.total_count

  // TODO : Count ai riviews by ai 

  const totalReviews = 44

  return {
    totalCommits,
    totalRepos,
    totalPRs,
    totalReviews
  }
 } catch (error) {
  console.log("Error fetching dashboard stats : ", error);
  return {
    totalCommits:0,
    totalRepos:0,
    totalPRs:0,
    totalReviews:0
  }
 }

}

export async function getMonthlyActivity() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const { data: user } = await octokit.rest.users.getAuthenticated();
    const calendar = await fetchUserContribution(token, user.login);

    if (!calendar) return [];

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr",
      "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec",
    ];

    const monthlyData: Record<
      string,
      { commits: number; prs: number; reviews: number }
    > = {};

    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthNames[d.getMonth()];
      monthlyData[key] = { commits: 0, prs: 0, reviews: 0 };
    }

    // ✅ Commits
    calendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        const d = new Date(day.date);
        const key = monthNames[d.getMonth()];
        if (monthlyData[key]) {
          monthlyData[key].commits += day.contributionCount;
        }
      });
    });

    // ✅ Sample reviews (temporary)
    const reviews = Array.from({ length: 45 }, () => {
      const daysAgo = Math.floor(Math.random() * 180);
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return { createdAt: d };
    });

    reviews.forEach((r) => {
      const key = monthNames[r.createdAt.getMonth()];
      if (monthlyData[key]) {
        monthlyData[key].reviews += 1;
      }
    });

    // ✅ PRs (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const since = sixMonthsAgo.toISOString().split("T")[0];

    const { data: prs } =
      await octokit.rest.search.issuesAndPullRequests({
        q: `author:${user.login} type:pr created:>=${since}`,
        per_page: 100,
      });

    prs.items.forEach((pr: any) => {
      const d = new Date(pr.created_at);
      const key = monthNames[d.getMonth()];
      if (monthlyData[key]) {
        monthlyData[key].prs += 1;
      }
    });

    return Object.entries(monthlyData).map(([name, values]) => ({
      name,
      ...values,
    }));
  } catch (error) {
    console.error("Monthly activity error:", error);
    return [];
  }
}


