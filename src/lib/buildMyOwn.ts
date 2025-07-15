import { spawnSync } from "node:child_process";
import { debug } from "./logger";
import {
  getGithubProjectName,
  createDir,
  bmoOriginalProjectDir,
  bmoMyOwnProjectDir,
  bmoProjectDir,
  getTeachMdcPath,
  bmoCursorRulesDir,
  bmoTeachMdcPath,
} from "./utils";
import { copyFileSync, mkdirSync } from "node:fs";

export function buildMyOwn(url: string, basePath: string = ".") {
  debug("Github", url);
  const projectName = getGithubProjectName(url);
  debug("Project name", projectName);
  createDir(projectName, basePath);

  cloneOriginalProject(url, projectName, basePath);
  mkdirSync(bmoMyOwnProjectDir(projectName, basePath), { recursive: true });

  // 创建 .cursor/rules 目录
  const cursorRulesDir = bmoCursorRulesDir(projectName, basePath);
  mkdirSync(cursorRulesDir, { recursive: true });

  // 复制 teach.mdc 文件到 .cursor/rules 目录
  const sourceFile = getTeachMdcPath();
  const destFile = bmoTeachMdcPath(projectName, basePath);
  copyFileSync(sourceFile, destFile);

  debug("Copied teach.mdc to", destFile);

  spawnSync("cursor", [bmoProjectDir(basePath, projectName)]);
}

function cloneOriginalProject(url: string, projectName: string, basePath: string = ".") {
  const originalProjectDir = bmoOriginalProjectDir(projectName, basePath);
  spawnSync("git", ["clone", url, originalProjectDir]);
}

// Legacy function for backward compatibility
export function buildMyOwnLegacy(url: string) {
  return buildMyOwn(url, ".");
}
