import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

/* -------------------- TYPES -------------------- */

export interface ContributionCalendar {
  totalContributions: number;
  weeks: {
    contributionDays: {
      contributionCount: number;
      date: string;
      color: string;
    }[];
  }[];
}

export interface ContributionResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: ContributionCalendar;
    } | null;
  } | null;
}

/* -------------------- GITHUB TOKEN -------------------- */

export const getGithubToken = async (): Promise<string> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  if (!account?.accessToken) {
    throw new Error("GitHub token not found");
  }

  return account.accessToken;
};

/* -------------------- FETCH CONTRIBUTIONS -------------------- */

export const fetchUserContribution = async (
  token: string,
  username: string
): Promise<ContributionCalendar | null> => {
  const octokit = new Octokit({ auth: token });

  const query = `
    query ($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await octokit.graphql<ContributionResponse>(query, {
      username,
    });

    return (
      response.user?.contributionsCollection?.contributionCalendar ?? null
    );
  } catch (error) {
    console.error("GitHub GraphQL error:", error);
    return null;
  }
};
