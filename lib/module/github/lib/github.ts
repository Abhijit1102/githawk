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

interface ContributionResponse {
  user: {
    contributionCollection: {
      contributionCalendar: ContributionCalendar;
    };
  };
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
    throw new Error("No GitHub access token found");
  }

  return account.accessToken;
};

/* -------------------- CONTRIBUTIONS -------------------- */

export const fetchUserContribution = async (
  token: string,
  username: string
): Promise<ContributionCalendar> => {
  const octokit = new Octokit({ auth: token });

  const query = `
    query ($username: String!) {
      user(login: $username) {
        contributionCollection {
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

  const response = await octokit.graphql<ContributionResponse>(query, {
    username,
  });

  return response.user.contributionCollection.contributionCalendar;
};
