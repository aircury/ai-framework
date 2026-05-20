import * as p from "@clack/prompts";
import {
  CAPABILITIES,
  type CapabilityCategory,
  type CapabilityId,
  getCapabilities,
  getCapabilitySkills,
  getInitialCapabilityIds,
  resolveCapabilityIds,
} from "./capabilities";
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

function getCategoryTag(category: CapabilityCategory): string {
  switch (category) {
    case "workflow":
      return "Workflow";
    case "engineering":
      return "Engineering";
    case "frontend":
      return "Frontend";
    case "communication":
      return "Communication";
  }
}

const ARCHITECTURE_CAPABILITY_OPTIONS: {
  value: CapabilityId;
  label: string;
  hint: string;
}[] = [
  {
    value: "ddd-hexagonal",
    label: "DDD+Hexagonal",
    hint: "DDD, ports, and adapters",
  },
  {
    value: "clean-architecture",
    label: "Clean Architecture",
    hint: "entities, use cases, adapters, and drivers",
  },
  {
    value: "layered-architecture",
    label: "Layered Architecture",
    hint: "controllers, services, and repositories",
  },
  {
    value: "custom-architecture",
    label: "Custom Architecture",
    hint: "discover and document this project's real architecture",
  },
];

const ARCHITECTURE_CAPABILITY_IDS = ARCHITECTURE_CAPABILITY_OPTIONS.map(
  (option) => option.value,
);

function isArchitectureCapabilityId(
  capabilityId: CapabilityId,
): capabilityId is (typeof ARCHITECTURE_CAPABILITY_IDS)[number] {
  return ARCHITECTURE_CAPABILITY_IDS.includes(capabilityId);
}

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
      "Universal agents supported through AGENTS.md and selected capabilities",
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
    message:
      scope === "global"
        ? "Additional agent integrations — also install global agent-specific skills"
        : "Additional tools",
    options: toolOptions,
    initialValues:
      scope === "global" ? [] : toolOptions.map((option) => option.value),
    required: false,
  });

  if (p.isCancel(selectedTools)) return p.cancel("Cancelled.");

  let enforceBritishEnglish = false;
  if (scope === "local") {
    const britishEnglish = await p.confirm({
      message:
        "Use British English in generated rules and include the language capability?",
      initialValue: true,
    });

    if (p.isCancel(britishEnglish)) return p.cancel("Cancelled.");
    enforceBritishEnglish = britishEnglish;
  }

  const availableCapabilities = getCapabilities(scope);
  const initialCapabilityIds = getInitialCapabilityIds(scope, {
    britishEnglish: enforceBritishEnglish,
  });
  const availableArchitectureCapabilities =
    ARCHITECTURE_CAPABILITY_OPTIONS.filter((option) =>
      availableCapabilities.some(
        (capability) => capability.id === option.value,
      ),
    );
  const selectedArchitecture = await p.select<CapabilityId>({
    message: "Architecture capability (required)",
    options: availableArchitectureCapabilities,
  });

  if (p.isCancel(selectedArchitecture)) return p.cancel("Cancelled.");

  const availableNonArchitectureCapabilities = availableCapabilities.filter(
    (capability) => !isArchitectureCapabilityId(capability.id),
  );
  const selectedNonArchitectureCapabilities = await p.multiselect<CapabilityId>(
    {
      message: "Other capabilities",
      options: availableNonArchitectureCapabilities.map((capability) => ({
        value: capability.id,
        label: `[${getCategoryTag(capability.category)}] ${capability.label}`,
        hint: capability.hint,
      })),
      initialValues: initialCapabilityIds.filter(
        (capabilityId) => !isArchitectureCapabilityId(capabilityId),
      ),
      required: false,
    },
  );

  if (p.isCancel(selectedNonArchitectureCapabilities))
    return p.cancel("Cancelled.");

  const selectedCapabilities = [
    selectedArchitecture,
    ...selectedNonArchitectureCapabilities,
  ];

  const resolvedCapabilities = resolveCapabilityIds(
    enforceBritishEnglish && !selectedCapabilities.includes("language")
      ? [...selectedCapabilities, "language"]
      : selectedCapabilities,
  ).filter((capabilityId) =>
    availableCapabilities.some((capability) => capability.id === capabilityId),
  );

  const implicitCapabilities = resolvedCapabilities.filter(
    (capabilityId) => !selectedCapabilities.includes(capabilityId),
  );

  if (resolvedCapabilities.length === 0) {
    p.note(
      "Only the core framework files will be installed. You can enable capabilities later by rerunning the installer.",
      "No capabilities selected",
    );
  }

  const cwd = process.cwd();
  const isGlobal = scope === "global";
  const files = isGlobal
    ? getGlobalFiles(selectedTools)
    : getLocalFiles(selectedTools, resolvedCapabilities, {
        britishEnglish: enforceBritishEnglish,
      });
  const commands = isGlobal
    ? getGlobalCommands(selectedTools, resolvedCapabilities)
    : getLocalCommands(selectedTools, resolvedCapabilities);
  const selectedSkills = getCapabilitySkills(resolvedCapabilities, scope);
  const selectedCapabilityEntries = CAPABILITIES.filter((capability) =>
    resolvedCapabilities.includes(capability.id),
  );

  if (files.length === 0 && commands.length === 0) {
    p.outro("Nothing to install.");
    return;
  }

  if (selectedCapabilityEntries.length > 0) {
    p.log.step(
      `${selectedCapabilityEntries.length} capabilit${selectedCapabilityEntries.length === 1 ? "y" : "ies"} selected`,
    );
    for (const capability of selectedCapabilityEntries) {
      p.log.info(
        `${capability.label} (${getCategoryTag(capability.category).toLowerCase()})`,
      );
    }
  }

  if (implicitCapabilities.length > 0) {
    p.log.step("Automatically included capabilities");
    for (const capabilityId of implicitCapabilities) {
      const capability = selectedCapabilityEntries.find(
        (entry) => entry.id === capabilityId,
      );
      if (capability) p.log.info(`+ ${capability.label}`);
    }
  }

  const conflicts = checkConflicts(files, cwd, isGlobal);
  const existingCount = conflicts.filter((conflict) => conflict.exists).length;

  if (files.length > 0) {
    p.log.step(
      `${files.length} files to install${existingCount > 0 ? `, ${existingCount} already exist` : ""}`,
    );
    for (const { file, exists } of conflicts) {
      p.log.info(`${exists ? "~" : "+"} ${file.path}`);
    }
  }

  if (selectedSkills.length > 0) {
    p.log.step(
      `${selectedSkills.length} skill${selectedSkills.length > 1 ? "s" : ""} will be installed`,
    );
    for (const skill of selectedSkills) {
      p.log.info(`- ${skill.skillName} (${skill.source})`);
    }
  }

  if (commands.length > 0) {
    p.log.step(
      `${commands.length} install command${commands.length > 1 ? "s" : ""} to run`,
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

  for (const command of commands) {
    const result = runCommand(command, cwd);
    if (!result.success) {
      spinner.stop("Installation failed.");

      p.log.warn(
        "No project files were written because skill installation failed.",
      );
      if (result.stdout.trim()) p.log.message(result.stdout.trim());
      if (result.stderr.trim()) p.log.error(result.stderr.trim());

      throw new Error(
        `Failed to run: ${command.command} ${command.args.join(" ")}`,
      );
    }

    executed++;
  }

  for (const { file, exists } of conflicts) {
    if (
      exists &&
      overwrite === "skip" &&
      !(!isGlobal && file.path === "AGENTS.md")
    ) {
      skipped++;
      continue;
    }
    writeFile(file, cwd, isGlobal);
    written++;
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
      `${executed} install command${executed > 1 ? "s" : ""} executed`,
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
