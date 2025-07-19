import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { debug } from "./logger";

// Supported editors
type EditorType = "cursor" | "claude-code";

// Editor configuration
interface EditorConfig {
  type: EditorType;
  rulesDir: string;
  rulesFile: string;
  launchCommand: string;
}

/**
 * Get editor configuration based on editor type
 */
function getEditorConfig(editorType: EditorType): EditorConfig {
  switch (editorType) {
    case "cursor":
      return {
        type: "cursor",
        rulesDir: ".cursor/rules",
        rulesFile: "teach.mdc",
        launchCommand: "cursor",
      };
    case "claude-code":
      return {
        type: "claude-code",
        rulesDir: "",
        rulesFile: "CLAUDE.md",
        launchCommand: "claude-code",
      };
    default:
      throw new Error(`Unsupported editor type: ${editorType}`);
  }
}

/**
 * Detect available editors in the system
 */
function detectAvailableEditors(): EditorType[] {
  const editors: EditorType[] = [];

  // Check for Cursor
  try {
    const cursorResult = spawnSync("cursor", ["--version"], { timeout: 5000 });
    if (cursorResult.status === 0) {
      editors.push("cursor");
    }
  } catch (error) {
    debug("Cursor not found:", error);
  }

  // Check for Claude Code
  try {
    const claudeResult = spawnSync("claude-code", ["--version"], {
      timeout: 5000,
    });
    if (claudeResult.status === 0) {
      editors.push("claude-code");
    }
  } catch (error) {
    debug("Claude Code not found:", error);
  }

  return editors;
}

/**
 * Get the path to rules file in assets directory based on editor type
 * @param editorType The editor type (cursor or claude-code)
 */
function getRulesAssetPath(editorType: EditorType = "cursor") {
  const config = getEditorConfig(editorType);
  return path.resolve(__dirname, "..", "..", "assets", config.rulesFile);
}

/**
 * Get the rules directory path for a project based on editor type
 * @param projectName The project name
 * @param editorType The editor type (cursor or claude-code)
 * @param basePath The base path (default: ".")
 */
function bmoRulesDir(
  projectName: string,
  editorType: EditorType = "cursor",
  basePath: string = ".",
) {
  const config = getEditorConfig(editorType);
  if (config.rulesDir) {
    return bmoProjectDir(basePath, projectName, ...config.rulesDir.split("/"));
  }
  // For Claude Code, rules file is in the project root
  return bmoProjectDir(basePath, projectName);
}

/**
 * Get the path for rules file in the project directory
 * @param projectName The project name
 * @param editorType The editor type (cursor or claude-code)
 * @param basePath The base path (default: ".")
 */
function bmoRulesFilePath(
  projectName: string,
  editorType: EditorType = "cursor",
  basePath: string = ".",
) {
  const config = getEditorConfig(editorType);
  const rulesDir = bmoRulesDir(projectName, editorType, basePath);
  return path.join(rulesDir, config.rulesFile);
}

/**
 * Get the path for teach.mdc in the project's .cursor/rules directory
 * @deprecated Use bmoRulesFilePath instead
 */
function bmoTeachMdcPath(projectName: string, basePath: string = ".") {
  return bmoRulesFilePath(projectName, "cursor", basePath);
}

function bmoProjectDir(basePath: string = ".", ...paths: string[]) {
  return path.resolve(basePath, ...paths);
}

function bmoOriginalProjectDir(projectName: string, basePath: string = ".") {
  return bmoProjectDir(basePath, projectName, `${projectName}-original`);
}

function bmoMyOwnProjectDir(projectName: string, basePath: string = ".") {
  return bmoProjectDir(basePath, projectName, `${projectName}-my-own`);
}

function getGithubProjectName(url: string) {
  const splitted = url.split("/");
  if (splitted.length === 0) {
    throw new Error("Invalid Github url");
  }

  const last = splitted[splitted.length - 1];
  if (!last.endsWith(".git")) {
    throw new Error("Invalid Github url");
  }

  return last.slice(0, -4);
}

/**
 * Create a dir at current working directory. If the dir already exists, throw an error.
 * @param dirname The name of directory to create
 * @param basePath Base path where to create the directory
 */
function createDir(dirname: string, basePath: string = ".") {
  const dirPath = bmoProjectDir(basePath, dirname);
  debug("Creating dir", dirPath);

  if (fs.existsSync(dirPath)) {
    throw new Error(`Directory ${dirname} already exists`);
  }

  fs.mkdirSync(dirPath, { recursive: true });
}

// ===== MCP-friendly utility functions =====

/**
 * Clone a GitHub project and set up learning environment with AI teaching rules
 * @param githubUrl GitHub repository URL
 * @param basePath Base directory path where the project should be created
 */
export async function cloneAndSetupProject(
  githubUrl: string,
  basePath: string = ".",
) {
  debug("[cloneAndSetupProject] starting", githubUrl, basePath);

  try {
    const projectName = getGithubProjectName(githubUrl);
    debug(`projectName: ${projectName}`);

    // Create project directory
    createDir(projectName, basePath);

    // Clone original project
    const originalProjectDir = bmoOriginalProjectDir(projectName, basePath);
    const cloneResult = spawnSync("git", [
      "clone",
      githubUrl,
      originalProjectDir,
    ]);

    if (cloneResult.error) {
      throw new Error(
        `Failed to clone repository: ${cloneResult.error.message}`,
      );
    }

    // Create my-own directory
    const myOwnDir = bmoMyOwnProjectDir(projectName, basePath);
    fs.mkdirSync(myOwnDir, { recursive: true });

    // Create rules files for both editors
    const rulesFiles = [];
    const editorTypes: EditorType[] = ["cursor", "claude-code"];

    for (const editorType of editorTypes) {
      const config = getEditorConfig(editorType);

      debug(`config for ${editorType} is ${JSON.stringify(config, null, 2)}`);

      // Create rules directory (if needed) and copy rules file
      const rulesDir = bmoRulesDir(projectName, editorType, basePath);
      if (config.rulesDir) {
        fs.mkdirSync(rulesDir, { recursive: true });
      }

      const sourceFile = getRulesAssetPath(editorType);
      const destFile = bmoRulesFilePath(projectName, editorType, basePath);
      fs.copyFileSync(sourceFile, destFile);
      debug(`Copied file from ${sourceFile} to ${destFile}`);

      rulesFiles.push({
        editorType,
        rulesPath: destFile,
      });
    }

    const projectDir = bmoProjectDir(basePath, projectName);

    return {
      success: true,
      message: `Successfully cloned and set up project: ${projectName}`,
      projectName,
      projectPath: projectDir,
      originalPath: originalProjectDir,
      myOwnPath: myOwnDir,
      rulesFiles,
      detectedEditors: detectAvailableEditors(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to clone and setup project: ${errorMessage}`);
  }
}
