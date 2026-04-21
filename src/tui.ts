import * as p from "@clack/prompts";
import type { StandardModuleId } from "./framework";
import { STANDARD_MODULES } from "./framework";
import type { Scope, Tool } from "./install";
import {
  checkConflicts,
  getGlobalCommands,
  getGlobalFiles,
  getLocalCommands,
  getLocalFiles,
  runCommand,
  updateGitignore,
  writeFile,
} from "./install";
import {
  expandSkillGroups,
  getInitialSkillGroupIds,
  getSkillGroups,
} from "./skills-catalog";

export async function run(): Promise<void> {
  p.intro("Aircury AI Framework Installer");

  const scope = await p.select<Scope>({
    message: "What do you want to configure?",
    options: [
      { value: "local", label: "Local", hint: "configure this project" },
      { value: "global", label: "Global", hint: "configure this machine" },
    ],
  });

  if (p.isCancel(scope)) return p.cancel("Cancelled.");

  if (scope === "local") {
    const universalTools = [
      "Amp",
      "Codex",
      "Cursor",
      "GitHub Copilot",
      "Kilo Code",
      "OpenCode",
    ];
    p.note(
      universalTools.join(" · "),
      "Universal agents supported through AGENTS.md and selected skills",
    );
  }

  const toolOptions: { value: Tool; label: string; hint: string }[] =
    scope === "global"
      ? [
          {
            value: "claude-code",
            label: "Claude Code",
            hint: "installs ~/.claude/skills/",
          },
        ]
      : [
          {
            value: "claude-code",
            label: "Claude Code",
            hint: "CLAUDE.md + .claude/skills/",
          },
          { value: "gemini-cli", label: "Gemini CLI", hint: "GEMINI.md" },
        ];

  const selectedTools = await p.multiselect<Tool>({
    message: "Additional tools — need tool-specific config",
    options: toolOptions,
    initialValues: toolOptions.map((o) => o.value),
    required: false,
  });

  if (p.isCancel(selectedTools)) return p.cancel("Cancelled.");

  let selectedModules: StandardModuleId[] | symbol = [];
  let enforceBritishEnglish = false;
  if (scope === "local") {
    selectedModules = await p.multiselect<StandardModuleId>({
      message:
        "Standards modules — choose what this installation should enforce",
      options: STANDARD_MODULES.map((module) => ({
        value: module.id,
        label: module.label,
        hint: module.hint,
      })),
      initialValues: STANDARD_MODULES.filter(
        (module) => module.defaultEnabled,
      ).map((module) => module.id),
      required: false,
    });

    if (p.isCancel(selectedModules)) return p.cancel("Cancelled.");

    if (selectedModules.length === 0) {
      p.note(
        "Only the core workflow constitution will be installed. Optional standards can be re-enabled later by reinstalling or editing .aircury/framework.config.json.",
        "No optional standards selected",
      );
    }

    const britishEnglish = await p.confirm({
      message:
        "Enforce British English in generated rules and install the UK business English skill?",
      initialValue: true,
    });

    if (p.isCancel(britishEnglish)) return p.cancel("Cancelled.");
    enforceBritishEnglish = britishEnglish;
  }

  const skillScope = scope === "global" ? "global" : "local";
  const aircurySkillGroups = getSkillGroups(skillScope, "aircury");
  const externalSkillGroups = getSkillGroups(skillScope, "external");
  const skillGroupOptions = [
    ...aircurySkillGroups.map((group) => ({
      value: group.id,
      label: group.label,
      hint: `Aircury · ${group.description}`,
    })),
    ...externalSkillGroups.map((group) => ({
      value: group.id,
      label: group.label,
      hint: `External · ${group.description}`,
    })),
  ];

  let selectedSkillGroups: string[] | symbol = [];
  if (skillGroupOptions.length > 0) {
    selectedSkillGroups = await p.multiselect<string>({
      message: "Skill groups — choose which workflows to install",
      options: skillGroupOptions,
      initialValues: getInitialSkillGroupIds(skillScope, {
        britishEnglish: enforceBritishEnglish,
        moduleIds: selectedModules,
      }),
      required: false,
    });

    if (p.isCancel(selectedSkillGroups)) return p.cancel("Cancelled.");

    if (selectedSkillGroups.length === 0) {
      p.note(
        "No skills will be installed. You can still use the framework files and add skills later with npx skills add.",
        "No skill groups selected",
      );
    }
  }

  if (enforceBritishEnglish && !selectedSkillGroups.includes("language")) {
    selectedSkillGroups = [...selectedSkillGroups, "language"];
  }

  const cwd = process.cwd();
  const isGlobal = scope === "global";
  const files = isGlobal
    ? getGlobalFiles(selectedTools)
    : getLocalFiles(selectedTools, selectedModules, {
        britishEnglish: enforceBritishEnglish,
      });
  const commands = isGlobal
    ? getGlobalCommands(selectedTools, selectedSkillGroups)
    : getLocalCommands(selectedTools, selectedSkillGroups);
  const selectedSkills = expandSkillGroups(selectedSkillGroups, skillScope);

  if (files.length === 0 && commands.length === 0) {
    p.outro("Nothing to install.");
    return;
  }

  const conflicts = checkConflicts(files, cwd, isGlobal);
  const existingCount = conflicts.filter((c) => c.exists).length;

  if (files.length > 0) {
    p.log.step(
      `${files.length} files to install${existingCount > 0 ? `, ${existingCount} already exist` : ""}`,
    );
    for (const { file, exists } of conflicts) {
      p.log.info(`${exists ? "~" : "+"} ${file.path}`);
    }
  }

  if (commands.length > 0) {
    p.log.step(
      `${selectedSkillGroups.length} skill group${selectedSkillGroups.length > 1 ? "s" : ""} selected`,
    );
    for (const group of getSkillGroups(skillScope).filter((entry) =>
      selectedSkillGroups.includes(entry.id),
    )) {
      p.log.info(`# ${group.label}`);
    }
    p.log.step(
      `${selectedSkills.length} skill${selectedSkills.length > 1 ? "s" : ""} will be installed`,
    );
    for (const skill of selectedSkills) {
      p.log.info(`- ${skill.skillName} (${skill.source})`);
    }
    p.log.step(
      `${commands.length} skills command${commands.length > 1 ? "s" : ""} to run`,
    );
    for (const command of commands) {
      p.log.info(`> ${command.command} ${command.args.join(" ")}`);
    }
  }

  const confirmed = await p.confirm({ message: "Proceed with installation?" });
  if (p.isCancel(confirmed) || !confirmed) return p.cancel("Cancelled.");

  let overwrite: "skip" | "overwrite" = "skip";
  if (existingCount > 0) {
    const choice = await p.select<"skip" | "overwrite">({
      message: "Some files already exist. What do you want to do?",
      options: [
        { value: "skip", label: "Skip existing", hint: "only write new files" },
        {
          value: "overwrite",
          label: "Overwrite all",
          hint: "replace existing files",
        },
      ],
    });

    if (p.isCancel(choice)) return p.cancel("Cancelled.");
    overwrite = choice;
  }

  const spinner = p.spinner();
  spinner.start("Installing...");

  let written = 0;
  let skipped = 0;
  let executed = 0;

  for (const { file, exists } of conflicts) {
    if (exists && overwrite === "skip") {
      skipped++;
      continue;
    }
    writeFile(file, cwd, isGlobal);
    written++;
  }

  for (const command of commands) {
    const result = runCommand(command, cwd);
    if (!result.success) {
      spinner.stop("Installation failed.");

      if (written > 0)
        p.log.success(
          `${written} file${written > 1 ? "s" : ""} written before failure`,
        );
      if (skipped > 0)
        p.log.warn(
          `${skipped} file${skipped > 1 ? "s" : ""} skipped (already exist)`,
        );
      if (result.stdout.trim()) p.log.message(result.stdout.trim());
      if (result.stderr.trim()) p.log.error(result.stderr.trim());

      throw new Error(
        `Failed to run: ${command.command} ${command.args.join(" ")}`,
      );
    }

    executed++;
  }

  spinner.stop("Done!");

  if (written > 0)
    p.log.success(`${written} file${written > 1 ? "s" : ""} written`);
  if (skipped > 0)
    p.log.warn(
      `${skipped} file${skipped > 1 ? "s" : ""} skipped (already exist)`,
    );
  if (executed > 0)
    p.log.success(
      `${executed} skills command${executed > 1 ? "s" : ""} executed`,
    );

  if (!isGlobal) {
    const gitignoreResult = updateGitignore(cwd);
    if (gitignoreResult.created) {
      p.log.success(".gitignore created with specs/changes/ entry");
    } else if (gitignoreResult.updated) {
      p.log.success(".gitignore updated with specs/changes/ entry");
    }
  }

  p.outro("Aircury AI Framework ready.");
}
