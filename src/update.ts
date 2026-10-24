import { createCapabilityProfile } from "./capabilities";
import {
  applyFileWrites,
  type FileWrite,
  getFrameworkVersion,
  getLocalFiles,
  type InstallCommand,
  planFileWrites,
  planLocalSkills,
  readProjectProfile,
  type SkillsSubmodule,
  type Tool,
  updateGitignore,
} from "./install";

export interface UpdateRuntime {
  cwd: string;
  dryRun?: boolean;
  frameworkVersion?: string;
  log: (line: string) => void;
  executeCommand: (
    command: InstallCommand,
    cwd: string,
  ) => { success: boolean; stdout: string; stderr: string };
}

export interface UpdateResult {
  ok: boolean;
  files: FileWrite[];
  commands: InstallCommand[];
  submodule: SkillsSubmodule | null;
}

/**
 * Brings a locally installed project to this framework version from its saved profile,
 * without prompts, so that an unattended agent can run it: the same file and skill plan
 * the interactive installer applies.
 */
export function runUpdate({
  cwd,
  dryRun = false,
  frameworkVersion,
  log,
  executeCommand,
}: UpdateRuntime): UpdateResult {
  const saved = readProjectProfile(cwd);
  if (!saved) {
    log(
      "No valid .aircury/framework.config.json in this directory: run the interactive installer first.",
    );
    return { ok: false, files: [], commands: [], submodule: null };
  }

  const tools = (saved.tools ?? []) as Tool[];
  const britishEnglish = saved.language.britishEnglish;
  const { capabilities } = createCapabilityProfile(saved.capabilities, {
    britishEnglish,
    tools,
  });
  const files = getLocalFiles(tools, capabilities, {
    britishEnglish,
    frameworkVersion: frameworkVersion ?? getFrameworkVersion(),
  });
  const skills = planLocalSkills(tools, capabilities, cwd);
  const plan = planFileWrites(files, cwd);
  const result = {
    files: plan,
    commands: skills.commands,
    submodule: skills.submodule,
  };

  for (const { action, path } of plan) {
    if (action !== "unchanged") log(`${action} ${path}`);
  }
  if (skills.submodule) {
    log(
      `${skills.submodule.path} is a git submodule: no skills installed there (its repository owns them).`,
    );
    if (!skills.submodule.initialised)
      log(
        `${skills.submodule.path} is not initialised, so which skills it provides is unknown: run \`git submodule update --init\` first.`,
      );
    else if (skills.submodule.missing.length > 0)
      log(
        `Not in the submodule (add them to its repository): ${skills.submodule.missing.join(", ")}.`,
      );
  }
  for (const command of skills.commands) {
    log(`> ${command.command} ${command.args.join(" ")}`);
  }

  if (dryRun) {
    log("Dry run: nothing written.");
    return { ok: true, ...result };
  }

  for (const command of skills.commands) {
    const outcome = executeCommand(command, cwd);
    if (!outcome.success) {
      log(
        `Failed: ${command.command} ${command.args.join(" ")}. No project files were written.`,
      );
      if (outcome.stderr.trim()) log(outcome.stderr.trim());
      return { ok: false, ...result };
    }
  }

  applyFileWrites(plan, cwd);
  updateGitignore(cwd);
  log("Aircury AI Framework updated.");
  return { ok: true, ...result };
}
