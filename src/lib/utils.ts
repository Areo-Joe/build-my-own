import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { debug } from "./logger";

export function currentDir() {
  return process.cwd();
}

/**
 * Get the path to teach.mdc file in assets directory
 * 直接使用相对路径：从 src/lib/ 到 assets/teach.mdc
 */
export function getTeachMdcPath() {
  return path.resolve(__dirname, "..", "..", "assets", "teach.mdc");
}

/**
 * Get the .cursor/rules directory path for a project
 */
export function bmoCursorRulesDir(projectName: string, basePath: string = ".") {
  return bmoProjectDir(basePath, projectName, ".cursor", "rules");
}

/**
 * Get the path for teach.mdc in the project's .cursor/rules directory
 */
export function bmoTeachMdcPath(projectName: string, basePath: string = ".") {
  return bmoProjectDir(basePath, projectName, ".cursor", "rules", "teach.mdc");
}

export function bmoProjectDir(basePath: string = ".", ...paths: string[]) {
  return path.resolve(basePath, ...paths);
}

export function bmoOriginalProjectDir(projectName: string, basePath: string = ".") {
  return bmoProjectDir(basePath, projectName, `${projectName}-original`);
}

export function bmoMyOwnProjectDir(projectName: string, basePath: string = ".") {
  return bmoProjectDir(basePath, projectName, `${projectName}-my-own`);
}

export function getGithubProjectName(url: string) {
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
export function createDir(dirname: string, basePath: string = ".") {
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
export async function cloneAndSetupProject(githubUrl: string, basePath: string = ".") {
  try {
    const projectName = getGithubProjectName(githubUrl);
    
    // Create project directory
    createDir(projectName, basePath);
    
    // Clone original project
    const originalProjectDir = bmoOriginalProjectDir(projectName, basePath);
    const cloneResult = spawnSync("git", ["clone", githubUrl, originalProjectDir]);
    
    if (cloneResult.error) {
      throw new Error(`Failed to clone repository: ${cloneResult.error.message}`);
    }
    
    // Create my-own directory
    const myOwnDir = bmoMyOwnProjectDir(projectName, basePath);
    fs.mkdirSync(myOwnDir, { recursive: true });
    
    // Create .cursor/rules directory and copy teach.mdc
    const cursorRulesDir = bmoCursorRulesDir(projectName, basePath);
    fs.mkdirSync(cursorRulesDir, { recursive: true });
    
    const sourceFile = getTeachMdcPath();
    const destFile = bmoTeachMdcPath(projectName, basePath);
    fs.copyFileSync(sourceFile, destFile);
    
    const projectDir = bmoProjectDir(basePath, projectName);
    
    return {
      success: true,
      message: `Successfully cloned and set up project: ${projectName}`,
      projectName,
      projectPath: projectDir,
      originalPath: originalProjectDir,
      myOwnPath: myOwnDir,
      rulesPath: destFile,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to clone and setup project: ${errorMessage}`);
  }
}

/**
 * Create or update cursor rules file for AI-assisted learning
 * @param projectPath Path to the project directory
 * @param rulesContent Custom rules content (optional)
 */
export async function createRulesFile(projectPath: string, rulesContent?: string) {
  try {
    const cursorRulesDir = path.join(projectPath, ".cursor", "rules");
    
    // Ensure .cursor/rules directory exists
    fs.mkdirSync(cursorRulesDir, { recursive: true });
    
    const rulesFilePath = path.join(cursorRulesDir, "teach.mdc");
    
    if (rulesContent) {
      // Use custom rules content
      fs.writeFileSync(rulesFilePath, rulesContent, "utf8");
    } else {
      // Use default teach.mdc content
      const sourceFile = getTeachMdcPath();
      fs.copyFileSync(sourceFile, rulesFilePath);
    }
    
    return {
      success: true,
      message: `Successfully created/updated rules file`,
      rulesPath: rulesFilePath,
      customContent: !!rulesContent,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create rules file: ${errorMessage}`);
  }
}

/**
 * List all build-my-own projects in the specified directory
 * @param basePath Base directory to search for projects
 */
export async function listProjects(basePath: string = ".") {
  try {
    const resolvedBasePath = path.resolve(basePath);
    
    if (!fs.existsSync(resolvedBasePath)) {
      throw new Error(`Directory does not exist: ${resolvedBasePath}`);
    }
    
    const items = fs.readdirSync(resolvedBasePath, { withFileTypes: true });
    const projects = [];
    
    for (const item of items) {
      if (item.isDirectory()) {
        const projectPath = path.join(resolvedBasePath, item.name);
        
        // Check if this looks like a build-my-own project
        const originalDir = path.join(projectPath, `${item.name}-original`);
        const myOwnDir = path.join(projectPath, `${item.name}-my-own`);
        const rulesFile = path.join(projectPath, ".cursor", "rules", "teach.mdc");
        
        if (fs.existsSync(originalDir) || fs.existsSync(myOwnDir) || fs.existsSync(rulesFile)) {
          const projectInfo: any = {
            name: item.name,
            path: projectPath,
            hasOriginal: fs.existsSync(originalDir),
            hasMyOwn: fs.existsSync(myOwnDir),
            hasRules: fs.existsSync(rulesFile),
          };
          
          // Try to read package.json for additional info
          const packageJsonPath = path.join(originalDir, "package.json");
          if (fs.existsSync(packageJsonPath)) {
            try {
              const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
              projectInfo.description = packageJson.description;
              projectInfo.language = "javascript/typescript";
            } catch {
              // Ignore package.json read errors
            }
          }
          
          projects.push(projectInfo);
        }
      }
    }
    
    return {
      success: true,
      basePath: resolvedBasePath,
      projects,
      count: projects.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to list projects: ${errorMessage}`);
  }
}

// Legacy functions for backward compatibility (updated to use new path-aware versions)
export function createDirLegacy(dirname: string) {
  return createDir(dirname, ".");
}
