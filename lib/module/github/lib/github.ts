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

    return response.user?.contributionsCollection?.contributionCalendar ?? null;
  } catch (error) {
    console.error("GitHub GraphQL error:", error);
    return null;
  }
};

/* -------------------- REPOSITORIES -------------------- */

export const getRepositories = async (
    page: number = 1,
    perPage: number = 10
  ) => {
    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      direction: "desc",
      visibility: "all",
      per_page: perPage,
      page,
    });

    return data;
  };

/* -------------------- WEBHOOKS -------------------- */
export const createWebhook = async (owner:string, repo:string) => {
  const token = await getGithubToken();
  const octokit = new Octokit({
    auth:token
  });
  
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhook/github`;

  const {data:hooks} = await octokit.rest.repos.listWebhooks({
    owner,
    repo
  });

  // console.log("hooks : ",hooks)

  const existingHook = hooks.find(hook=>hook.config.url === webhookUrl);
  if(existingHook) {
    return existingHook;
  }

  const {data} = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type:"json"
    },
    events:["pull_request"]
  });

  return data;

}


export const deleteWebhook = async(owner:string, repo:string) => {
  const token = await getGithubToken();
  const octokit = new Octokit({
    auth:token
  });

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhook/github`;

  try {
    const {data:hooks} = await octokit.rest.repos.listWebhooks({
      owner,
      repo
    });

    const hookToDelete = hooks.find(hook => hook.config.url === webhookUrl);

    if(hookToDelete){
      await octokit.rest.repos.delete({
        owner,
        repo,
        hook_id:hookToDelete.id
      })
      return true;
    }

    return false;


  } catch (error) {
    console.error(`Error deleting webhook : ${error}`);
    return false;
  }

}

export async function getRepoFileContents (
  token: string,
  owner: string,
  repo: string,
  path: string = ""
): Promise<{path:string, content:string}[]>{
   const octokit = new Octokit({ auth:token });
   const {data} = await octokit.rest.repos.getContent({
    owner,
    repo,
    path
   });

   if(!Array.isArray(data)) {
    if (data.type == "file" && data.content) {
      return [{
        path:data.path,
        content: Buffer.from(data.content, "base64").toString("utf-8"),
      }];
    }
    return [];
   }

   let files: {path:string, content:string}[] = [];
   
   for(const item of data){
    if(item.type === "file"){
      const {data:fileData} = await octokit.rest.repos.getContent({
        owner,
        repo,
        path:item.path
      })

      if(!Array.isArray(fileData) && fileData.type === "file" && fileData.content) {
        if(!item.path.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz)$/i)){
          files.push({
            path:item.path,
            content: Buffer.from(fileData.content, "base64").toString("utf-8"),
          });
        }
      }

    }  else if (item.type === "dir"){
        const subFiles = await getRepoFileContents(token, owner, repo, item.path)
        files = files.concat(subFiles)
    }

   }

   return  files

}

export async function getPullRequestDiff(
  token:string,
  owner:string,
  repo:string,
  prNumber:number
) {
  const octokit = new Octokit({auth:token});
  const {data:pr} = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number:prNumber
  })

  const {data:diff} = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number:prNumber,
    mediaType:{
      format:"diff"
    }
  });

  return {
    diff: diff as unknown as string,
    title: pr.title,
    description: pr.body || "",
  }
};

export async function postReviewComment(
  token:string,
  owner:string,
  repo:string,
  prNumber:number,
  review:string
){
  const octokit = new Octokit({auth:token});

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number:prNumber,
    body:`## 🤖 AI Code Review\n\n ✨ **Automated insights generated by AI** -- ${review} -- \n\n ---\n*🔍 *Reviewed with precision & care* \n ⚡ *Powered by **Githawk***`
  })
}
