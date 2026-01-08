import prisma from "@/lib/db";
import { inngest } from "../client";
import { getRepoFileContents } from "@/lib/module/github/lib/github";
import { indexCodebase } from "@/lib/module/ai/lib/rag";

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },

  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    // 1️⃣ Fetch repo files
    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          providerId: "github", // ✅ FIXED
        },
      });

      if (!account?.accessToken) {
        throw new Error("No GitHub access token found");
      }

      return getRepoFileContents(account.accessToken, owner, repo);
    });

    if (!files.length) {
      return {
        success: true,
        indexedFiles: 0,
        message: "No files found to index",
      };
    }

    // 2️⃣ Index codebase
    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repo}`, files); // ✅ FIXED
    });

    return {
      success: true, // ✅ FIXED
      indexedFiles: files.length,
    };
  }
);
