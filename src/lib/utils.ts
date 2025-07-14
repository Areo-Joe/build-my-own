import * as fs from "node:fs";
import * as path from "node:path";
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
export function bmoCursorRulesDir(projectName: string) {
  return bmoProjectDir(projectName, ".cursor", "rules");
}

/**
 * Get the path for teach.mdc in the project's .cursor/rules directory
 */
export function bmoTeachMdcPath(projectName: string) {
  return bmoProjectDir(projectName, ".cursor", "rules", "teach.mdc");
}

export function bmoProjectDir(...paths: string[]) {
  return path.join(currentDir(), ...paths);
}

export function bmoOriginalProjectDir(projectName: string) {
  return bmoProjectDir(projectName, `${projectName}-original`);
}

export function bmoMyOwnProjectDir(projectName: string) {
  return bmoProjectDir(projectName, `${projectName}-my-own`);
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
 */
export function createDir(dirname: string) {
  const dirPath = bmoProjectDir(dirname);
  debug("Creating dir", dirPath);

  if (fs.existsSync(dirPath)) {
    throw new Error(`Directory ${dirname} already exists`);
  }

  fs.mkdirSync(dirPath);
}
