import { spawnSync } from "node:child_process";
import { debug } from "./logger";
import {
  getGithubProjectName,
  createDir,
  bmoOriginalProjectDir,
  bmoMyOwnProjectDir,
  bmoProjectDir,
  getRulesAssetPath,
  bmoRulesDir,
  bmoRulesFilePath,
  getDefaultEditor,
  getEditorConfig,
  EditorType,
} from "./utils";
import { copyFileSync, mkdirSync } from "node:fs";

export function buildMyOwn(url: string, basePath: string = ".", editorType?: EditorType) {
  debug("Github", url);
  const projectName = getGithubProjectName(url);
  debug("Project name", projectName);
  createDir(projectName, basePath);

  cloneOriginalProject(url, projectName, basePath);
  mkdirSync(bmoMyOwnProjectDir(projectName, basePath), { recursive: true });

  // Auto-detect editor if not specified
  const selectedEditor = editorType || getDefaultEditor();
  const config = getEditorConfig(selectedEditor);
  
  // Create rules directory (if needed) and copy rules file
  const rulesDir = bmoRulesDir(projectName, selectedEditor, basePath);
  if (config.rulesDir) {
    mkdirSync(rulesDir, { recursive: true });
  }

  const sourceFile = getRulesAssetPath(selectedEditor);
  const destFile = bmoRulesFilePath(projectName, selectedEditor, basePath);
  copyFileSync(sourceFile, destFile);

  debug(`Copied ${config.rulesFile} to`, destFile);
  debug(`Launching ${selectedEditor} editor...`);

  try {
    spawnSync(config.launchCommand, [bmoProjectDir(basePath, projectName)]);
  } catch (error) {
    debug(`Failed to launch ${selectedEditor}:`, error);
    console.warn(`Warning: Could not launch ${selectedEditor}. Please open the project manually at: ${bmoProjectDir(basePath, projectName)}`);
  }
}

function cloneOriginalProject(url: string, projectName: string, basePath: string = ".") {
  const originalProjectDir = bmoOriginalProjectDir(projectName, basePath);
  spawnSync("git", ["clone", url, originalProjectDir]);
}

// Legacy function for backward compatibility
export function buildMyOwnLegacy(url: string) {
  return buildMyOwn(url, ".", "cursor"); // Default to cursor for backward compatibility
}
