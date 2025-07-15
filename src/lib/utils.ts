import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { debug } from "./logger";

// Supported editors
export type EditorType = "cursor" | "claude-code";

// Editor configuration
export interface EditorConfig {
  type: EditorType;
  rulesDir: string;
  rulesFile: string;
  launchCommand: string;
}

export function currentDir() {
  return process.cwd();
}

/**
 * Get editor configuration based on editor type
 */
export function getEditorConfig(editorType: EditorType): EditorConfig {
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
export function detectAvailableEditors(): EditorType[] {
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
    const claudeResult = spawnSync("claude-code", ["--version"], { timeout: 5000 });
    if (claudeResult.status === 0) {
      editors.push("claude-code");
    }
  } catch (error) {
    debug("Claude Code not found:", error);
  }
  
  return editors;
}

/**
 * Get the default editor based on availability
 */
export function getDefaultEditor(): EditorType {
  const availableEditors = detectAvailableEditors();
  
  // Prefer Claude Code if available, otherwise fall back to Cursor
  if (availableEditors.includes("claude-code")) {
    return "claude-code";
  } else if (availableEditors.includes("cursor")) {
    return "cursor";
  }
  
  // Default to cursor if no editors detected (for backward compatibility)
  return "cursor";
}

/**
 * Get the path to rules file in assets directory based on editor type
 * @param editorType The editor type (cursor or claude-code)
 */
export function getRulesAssetPath(editorType: EditorType = "cursor") {
  const config = getEditorConfig(editorType);
  return path.resolve(__dirname, "..", "..", "assets", config.rulesFile);
}

/**
 * Get the path to teach.mdc file in assets directory
 * 直接使用相对路径：从 src/lib/ 到 assets/teach.mdc
 * @deprecated Use getRulesAssetPath instead
 */
export function getTeachMdcPath() {
  return getRulesAssetPath("cursor");
}

/**
 * Get the rules directory path for a project based on editor type
 * @param projectName The project name
 * @param editorType The editor type (cursor or claude-code)
 * @param basePath The base path (default: ".")
 */
export function bmoRulesDir(projectName: string, editorType: EditorType = "cursor", basePath: string = ".") {
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
export function bmoRulesFilePath(projectName: string, editorType: EditorType = "cursor", basePath: string = ".") {
  const config = getEditorConfig(editorType);
  const rulesDir = bmoRulesDir(projectName, editorType, basePath);
  return path.join(rulesDir, config.rulesFile);
}

/**
 * Get the .cursor/rules directory path for a project
 * @deprecated Use bmoRulesDir instead
 */
export function bmoCursorRulesDir(projectName: string, basePath: string = ".") {
  return bmoRulesDir(projectName, "cursor", basePath);
}

/**
 * Get the path for teach.mdc in the project's .cursor/rules directory
 * @deprecated Use bmoRulesFilePath instead
 */
export function bmoTeachMdcPath(projectName: string, basePath: string = ".") {
  return bmoRulesFilePath(projectName, "cursor", basePath);
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
 * @param editorType The editor type to setup for (auto-detect if not specified)
 */
export async function cloneAndSetupProject(githubUrl: string, basePath: string = ".", editorType?: EditorType) {
  try {
    const projectName = getGithubProjectName(githubUrl);
    
    // Auto-detect editor if not specified
    const selectedEditor = editorType || getDefaultEditor();
    const config = getEditorConfig(selectedEditor);
    
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
    
    // Create rules directory (if needed) and copy rules file
    const rulesDir = bmoRulesDir(projectName, selectedEditor, basePath);
    if (config.rulesDir) {
      fs.mkdirSync(rulesDir, { recursive: true });
    }
    
    const sourceFile = getRulesAssetPath(selectedEditor);
    const destFile = bmoRulesFilePath(projectName, selectedEditor, basePath);
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
      editorType: selectedEditor,
      detectedEditors: detectAvailableEditors(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to clone and setup project: ${errorMessage}`);
  }
}

/**
 * Create or update rules file for AI-assisted learning
 * @param projectPath Path to the project directory
 * @param rulesContent Custom rules content (optional)
 * @param editorType The editor type to setup for (auto-detect if not specified)
 */
export async function createRulesFile(projectPath: string, rulesContent?: string, editorType?: EditorType) {
  try {
    const selectedEditor = editorType || getDefaultEditor();
    const config = getEditorConfig(selectedEditor);
    
    // Create rules directory if needed
    let rulesDir = projectPath;
    if (config.rulesDir) {
      rulesDir = path.join(projectPath, ...config.rulesDir.split("/"));
      fs.mkdirSync(rulesDir, { recursive: true });
    }
    
    const rulesFilePath = path.join(rulesDir, config.rulesFile);
    
    if (rulesContent) {
      // Use custom rules content
      fs.writeFileSync(rulesFilePath, rulesContent, "utf8");
    } else {
      // Use default rules content for the selected editor
      const sourceFile = getRulesAssetPath(selectedEditor);
      fs.copyFileSync(sourceFile, rulesFilePath);
    }
    
    return {
      success: true,
      message: `Successfully created/updated rules file for ${selectedEditor}`,
      rulesPath: rulesFilePath,
      editorType: selectedEditor,
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
        
        // Check for rules files for different editors
        const cursorRulesFile = path.join(projectPath, ".cursor", "rules", "teach.mdc");
        const claudeRulesFile = path.join(projectPath, "CLAUDE.md");
        
        const hasRulesFiles = fs.existsSync(cursorRulesFile) || fs.existsSync(claudeRulesFile);
        
        if (fs.existsSync(originalDir) || fs.existsSync(myOwnDir) || hasRulesFiles) {
          const projectInfo: any = {
            name: item.name,
            path: projectPath,
            hasOriginal: fs.existsSync(originalDir),
            hasMyOwn: fs.existsSync(myOwnDir),
            hasRules: hasRulesFiles,
            supportedEditors: [],
          };
          
          // Determine which editors are supported
          if (fs.existsSync(cursorRulesFile)) {
            projectInfo.supportedEditors.push("cursor");
          }
          if (fs.existsSync(claudeRulesFile)) {
            projectInfo.supportedEditors.push("claude-code");
          }
          
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
