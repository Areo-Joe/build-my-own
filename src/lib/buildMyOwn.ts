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

export function buildMyOwn(url: string) {
  debug("Github", url);
  const projectName = getGithubProjectName(url);
  debug("Project name", projectName);
  createDir(projectName);

  cloneOriginalProject(url, projectName);
  mkdirSync(bmoMyOwnProjectDir(projectName));

  // 创建 .cursor/rules 目录
  const cursorRulesDir = bmoCursorRulesDir(projectName);
  mkdirSync(cursorRulesDir, { recursive: true });

  // 复制 teach.mdc 文件到 .cursor/rules 目录
  const sourceFile = getTeachMdcPath();
  const destFile = bmoTeachMdcPath(projectName);
  copyFileSync(sourceFile, destFile);

  debug("Copied teach.mdc to", destFile);

  spawnSync("cursor", [bmoProjectDir(projectName)]);
}

function cloneOriginalProject(url: string, projectName: string) {
  const originalProjectDir = bmoOriginalProjectDir(projectName);
  spawnSync("git", ["clone", url, originalProjectDir]);
}
