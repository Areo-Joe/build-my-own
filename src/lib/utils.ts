import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { debug } from "./logger";

function getGithubProjectName(url: string) {
  const splitted = url.split("/");
  if (splitted.length === 0) {
    throw new Error("Invalid Github url");
  }

  const last = splitted[splitted.length - 1];
  if (!last.endsWith(".git")) {
    throw new Error("Invalid Github url, should end with `.git`");
  }

  return last.slice(0, -4);
}

// ===== MCP-friendly utility functions =====

/**
 * Clone a GitHub project and set up learning environment with AI teaching rules
 * @param githubUrl GitHub repository URL
 * @param basePath Base directory path where the project should be created
 */
export async function cloneAndSetupProject(githubUrl: string) {
  debug("[cloneAndSetupProject] starting", githubUrl);

  try {
    const projectName = getGithubProjectName(githubUrl);
    debug(`projectName: ${projectName}`);

    // Create project directory

    const projectDirAbsolutePath = path.resolve(projectName);
    fs.mkdirSync(projectDirAbsolutePath);

    // Clone original project

    // Absolute path of ./${projectName}/${projectName}-orginal
    const orginalProjectDirAbsolutePath = path.resolve(
      projectName,
      `${projectName}-original`,
    );
    const cloneResult = spawnSync("git", [
      "clone",
      githubUrl,
      orginalProjectDirAbsolutePath,
    ]);

    if (cloneResult.error) {
      throw new Error(
        `Failed to clone repository: ${cloneResult.error.message}`,
      );
    }

    // Set up an empty dir for rebuilding the project

    // Absolute path of ./${projectName}/${projectName}-my-own
    const myOwnProjectDirAbsolutePath = path.resolve(
      projectName,
      `${projectName}-my-own`,
    );
    fs.mkdirSync(myOwnProjectDirAbsolutePath);

    // Create rules files for AI
    const from = path.resolve(__dirname, "./assets");
    const to = projectDirAbsolutePath;
    fs.cpSync(from, to, {
      recursive: true,
    });
    const rulesFiles = getCopiedFilePath(from, to);

    return {
      success: true,
      message: `Successfully cloned and set up project: ${projectName}`,
      projectName,
      projectPath: projectDirAbsolutePath,
      originalPath: orginalProjectDirAbsolutePath,
      myOwnPath: myOwnProjectDirAbsolutePath,
      rulesFiles,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to clone and setup project: ${errorMessage}`);
  }
}

function getCopiedFilePath(sourceDir: string, targetDir: string) {
  const paths: string[] = [];

  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverse(entryPath);
      } else {
        const relativePath = path.relative(sourceDir, entryPath);
        const targetPath = path.join(targetDir, relativePath);

        paths.push(targetPath);
      }
    }
  }

  traverse(sourceDir);

  return paths;
}
