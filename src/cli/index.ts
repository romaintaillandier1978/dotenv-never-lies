#!/usr/bin/env node

import { program, CommanderError, Command } from "commander";
import { AssertCliOptions, assertCommand } from "./commands/assert.js";
import { initCliOptions, initCommand } from "./commands/init.js";
import { InferCliOptions, inferCommand } from "./commands/infer.js";
import { ExplainCliOptions, explainCommand, printHuman } from "./commands/explain.js";
import { exportCommand } from "./commands/export.js";
import { toFile } from "./utils/toFile.js";
import { DnlError, ExitCodes, ProcessEnvError, ValidationError } from "../errors.js";

import { ProgramCliOptions } from "./commands/program.js";
import { PackageJson } from "type-fest";

import pkg from "../../package.json" with { type: "json" };
import { TypesCliOptions, typesCommand } from "./commands/types.js";
import { verboseReport, printWarnings, printErrors } from "./utils/report.js";
import { AnnotateCliOptions, annotateCommand } from "./commands/annotate.js";
import { loaderExporters } from "../export/registry.js";

export const dnlPackageJson: PackageJson = pkg as PackageJson;

const exitCodeHelp: { [key in ExitCodes]: string } = {
    [ExitCodes.success]: "Success (everything is valid, exit OK)",
    [ExitCodes.usageError]: "Usage error or internal error",
    [ExitCodes.schemaNotFound]: "DNL schema not found or not resolved",
    [ExitCodes.validationError]: "Validation failed (invalid environment)",
    [ExitCodes.exportError]: "Export error (format, file writing, secret, etc.)",
    [ExitCodes.processEnvError]: "Process.env usage errors (invalid or missing variables)",
} as const;

// #region Program
program
    .name("dnl")
    //.version("0.3.0")
    .version(dnlPackageJson.version ?? "0.0.0")
    // allows passing positional arguments, before/after options
    .enablePositionalOptions()
    .exitOverride()
    .addHelpText(
        "before",
        `Summary:
  CLI for dotenv-never-lies.
  Validates typed environment variables from a TypeScript/Zod schema.
      `
    )
    .option("--schema <file>", "DNL schema file (e.g., path/to/my-dnl.ts). See the Environment schema section for details.")
    .addHelpText(
        "after",
        `\nExit codes:\n${Object.entries(exitCodeHelp)
            .map(([key, value]) => `  - ${key}: ${value}`)
            .join("\n")}
        `
    )
    .addHelpText(
        "after",
        `\nEnvironment schema:
  The dotenv-never-lies schema is resolved in the following order:
  1. --schema option if provided
  2. "dotenv-never-lies.schema" key in package.json
  3. Convention files:
    - env.dnl.ts
    - env.dnl.js
    - dnl.config.ts
    - dnl.config.js
  If no schema is found, the command fails.
        `
    )
    .addHelpText(
        "after",
        `\nExamples:
        
  # Check the environment at runtime and exit the process if the schema is not satisfied
  dnl assert 
  dnl assert --schema my-dnl.ts
  
  # Generate a documented .env file from the schema
  dnl generate 
  dnl generate --schema my-dnl.ts --out .env
  
  # Create an env.dnl.ts schema from an existing .env
  dnl infer --source .env
  
  # Display known variables and their description
  dnl explain

  # Export variables in docker-args format
  dnl export docker-args --source .env
  
    `
    );
// #endregion Program

// #region infer
program
    .command("infer")
    .description(
        "Generates a dotenv-never-lies schema from a .env file.\n" +
            "This command is intended as a starting point when migrating a project to DNL.\n" +
            "The generated schema must be reviewed and refined manually.\n"
    )
    .option("-s, --source <source>", "Source .env file", ".env")
    .option("-o, --out <file>", "Output DNL file", "env.dnl.ts")
    .option("-f, --force", "Overwrite existing file")
    .option("--verbose", "Verbose mode")
    .option("--no-guess-secret", "Do not try to guess sensitive variables (heuristic)")
    .option("--warn-on-duplicates", "Warn on duplicate environment variables instead of failing")
    .option("--presets <presets...>", "Presets to use for inference (no discovery of presets in package.json)")
    .option("--no-discover-presets", "Do not discover presets in package.json")
    .action(async (opts: InferCliOptions) => {
        const { content, out, report } = await inferCommand(opts);

        if (opts.verbose) {
            for (const v of verboseReport(report)) {
                console.log(v);
            }
        }

        if (out) {
            await toFile(content, out, opts.force ?? false);
        } else {
            console.log(content);
        }
        // for (const warning of warnings) {
        //     console.error(`${warning}`);
        // }
    })
    .addHelpText(
        "after",
        `\nExamples:
        
  # Generate an env.dnl.ts schema from a .env file, and will show every inference rules applied, with confidence scoring and reasons
  dnl infer --verbose
  
  # Generate an env.dnl.ts schema from a .env file, do not try to guess sensitive variables
  dnl infer --no-guess-secret
  
  # Generate an env.dnl.ts schema from a .env.local file
  dnl infer --source .env.local
  
  # Generate a my-dnl.ts schema from a .env file,
  dnl infer --out my-dnl.ts
  
  # Generate an env.dnl.ts schema from a .env file, and overwrite the existing file
  dnl infer --force 

  # Generate an env.dnl.ts schema from a .env file, and use only specified presets (no package.json scanning)
  dnl infer --presets prisma node

  # Generate an env.dnl.ts schema from a .env file, do not automatically discover presets in package.json
  dnl infer --no-discover-presets
  
  # Generate an env.dnl.ts schema from a .env file, prevent to fail on duplicate keys, warn instead (dnl will never be silent on duplicate keys)
  dnl infer --warn-on-duplicates

  # Generate an env.dnl.ts schema from a .env file, Minimal inference (no preset discovery, no secret guessing)
  dnl infer --no-discover-presets --no-guess-secret
  
  # Full documentation:
  # https://github.com/romaintaillandier1978/dotenv-never-lies/blob/main/docs/commands/infer.md
  `
    )
    .addHelpText("after", `\nDocs :\n  https://github.com/romaintaillandier1978/dotenv-never-lies/blob/main/docs/commands/infer.md\n`);
// #endregion infer

// #region types

program
    .command("types")
    .description(
        "Generate a TypeScript declaration file (.d.ts) from a DNL schema. \n" +
            "Use this command after you have finished documenting your DNL schema.\nThis command produces a static, IDE-only representation of your environment contract.\n" +
            "It enables rich IntelliSense (auto-completion, documentation on hover).\n"
    )
    .option("-o, --out <file>", "Output file")
    .option("-f, --force", "Overwrite the existing file, in conjunction with -o or --out")
    .action(async (opts: TypesCliOptions) => {
        const globalOpts = program.opts<ProgramCliOptions>();
        const { content, out } = await typesCommand({ ...opts, schema: globalOpts.schema });

        if (out) {
            await toFile(content, out, opts.force ?? false);
        } else {
            console.log(content);
        }
    })
    .addHelpText(
        "after",
        `\nExamples:

  # Generate types from ./env.dnl.ts (default) to src/types/env.dnl.d.ts (default)
  dnl types 
  
  # Generate types from specific dnl schema to specific location, with overwrite
  dnl --schema ./my-dnl.ts types --out ./path/to/my-dnl.d.ts --force \n`
    )
    .addHelpText("after", `\nDocs :\n  https://github.com/romaintaillandier1978/dotenv-never-lies/blob/master/docs/commands/types.md\n`);
//#endregion types

// #region annotation

program
    .command("annotate")
    .description(
        "Annotate process.env usages in the codebase.\n" +
            "This command scans your project and adds contextual annotations to help migrate from process.env to DNL-validated variables.\n"
    )
    .option("-r, --remove", "Remove all dnl annotations from the codebase")
    .option("-c, --check", "Check process.env usages (CI / git hooks)")
    .option("--warn-as-error", "Treat warnings as errors (check mode only)")
    .option("--silent-warn", "Do not display warnings (check mode only)")
    .option("--verbose", "Verbose mode")
    .action(async (opts: AnnotateCliOptions) => {
        const globalOpts = program.opts<ProgramCliOptions>();
        const report = await annotateCommand({ ...opts, schema: globalOpts.schema });

        if (opts.verbose) {
            for (const v of verboseReport(report)) {
                console.log(v);
            }
        }
        // if not in check mode, return
        if (report.mode !== "check") return;
        // if there are errors, throw an error
        // Or there is warning and warnAsError, throw an error
        if (report.summary.checkErrors > 0) {
            if (!opts.verbose)
                for (const v of printErrors(report)) {
                    console.log(v);
                }
            throw new ProcessEnvError("Process.env errors");
        }

        if (report.summary.checkWarnings > 0) {
            if (!opts.silentWarn && !opts.verbose)
                for (const v of printWarnings(report)) {
                    console.log(v);
                }
            if (opts.warnAsError) {
                throw new ProcessEnvError("Process.env warnings");
            }
        }
        // if there are no warnings and no errors, return
        return;
    })
    .addHelpText(
        "after",
        `\nExamples:
        
  # Annotate process.env usages in the codebase (local development)
  dnl annotate
  dnl --schema my-dnl.ts annotate
  
  # Remove all dnl annotations from the codebase
  # Recommended locally (schema preparation, onboarding)
  dnl annotate --remove
        
  # Check process.env usages (CI / pre-commit hook)
  dnl annotate --check
  dnl annotate --check --warn-as-error
  dnl --schema my-dnl.ts annotate --check
      `
    )
    .addHelpText("after", `\nDocs :\n  https://github.com/romaintaillandier1978/dotenv-never-lies/blob/main/docs/commands/annotate.md\n`);

// #endregion process.env

// #region assert
program
    .command("assert")
    .description("Verifies the runtime environment and exits the process if the schema is not satisfied.\n")
    .option("-s, --source <source>", "Variables source (default: process.env)")
    .option("--warn-on-duplicates", "Warn on duplicate environment variables instead of failing")
    .action(async (opts: AssertCliOptions) => {
        const globalOpts = program.opts<ProgramCliOptions>();
        const { warnings } = await assertCommand({ ...opts, schema: globalOpts.schema });
        for (const warning of warnings) {
            console.error(`${warning}`);
        }
        console.log("✅ Environment is valid");
    })
    .addHelpText(
        "after",
        `\nExamples:
        
  # Validate environment variables from process.env
  # Recommended in CI to prevent starting with an invalid configuration
  dnl assert
  dnl assert --schema my-dnl.ts
  
  # Validate environment variables from a .env file
  # Recommended locally (schema preparation, onboarding)
  dnl assert --source .env
  dnl assert --schema my-dnl.ts --source .env
  
  # validate environment variables from the file provided by the CI
  dnl assert --source $ENV_FILE
  dnl assert --schema my-dnl.ts --source $ENV_FILE
      `
    )
    .addHelpText("after", `\nDocs :\n  https://github.com/romaintaillandier1978/dotenv-never-lies/blob/main/docs/commands/assert.md\n`);
// #endregion assert

// #region init
program
    .command("init")
    .description(
        "Initialize an environment file from a DNL schema.\n" +
            "This command does NOT read any existing environment variables.\n" +
            "Useful to bootstrap a project or facilitate onboarding of a new developer.\n" +
            "Only default values defined in the schema are written.\n"
    )
    .option("-o, --out <file>", "Output file (default: .env)")
    .option("-f, --force", "Overwrite existing file")
    .action(async (opts: initCliOptions) => {
        const globalOpts = program.opts<ProgramCliOptions>();
        const { content, out } = await initCommand({ ...opts, schema: globalOpts.schema });
        await toFile(content, out, opts.force ?? false);
    })
    .addHelpText(
        "after",
        `\nExamples:
        
  # Initialize a .env file from the default DNL schema (env.dnl.ts)
  dnl init
  
  # Initialize a .env file from a specified DNL schema
  dnl init --schema my-dnl.ts
  
  # Initialize a .env.local file from the DNL schema
  dnl init --out .env.local
  
  # Initialize a .env file from a DNL schema and overwrite the existing file
  dnl init --out .env --force
      `
    )
    .addHelpText("after", `\nDocs :\n  https://github.com/romaintaillandier1978/dotenv-never-lies/blob/main/docs/commands/init.md\n`);
// #endregion init

// #region explain
program
    .command("explain")
    .description("Displays the list of known environment variables and their description.\n")
    .argument("[keys...]", "Keys to explain (0..N). Without argument, all keys.")
    .option("-f, --format <format>", 'Output format ("human" | "json")', "human")
    .action(async (keys: string[] | undefined, opts: ExplainCliOptions) => {
        const globalOpts = program.opts<ProgramCliOptions>();
        const { format, result } = await explainCommand({ keys: keys ?? [], schema: globalOpts.schema, format: opts.format });
        if (format === "human") {
            printHuman(result);
        } else {
            console.log(JSON.stringify(result, null, 2));
        }
    })
    .addHelpText(
        "after",
        `\nExamples:
        
  # explain all known variables and their description
  dnl explain
  
  # explain a variable in detail
  dnl explain NODE_ENV
  
  # machine-readable output
  dnl explain --format json
  
  # explain all known variables and their description from a schema
  dnl explain --schema my-dnl.ts
  
  # explain a subset of known variables and their description
  dnl explain NODE_ENV NODE_PORT 
        
      `
    )
    .addHelpText("after", `\nDocs :\n  https://github.com/romaintaillandier1978/dotenv-never-lies/blob/main/docs/commands/explain.md\n`);
// #endregion explain

// #region export

function applyCommonExportOptions(cmd: Command) {
    return cmd
        .option("-s, --source <source>", "Variables source (default: process.env if none provided)")
        .option("--warn-on-duplicates", "Warn on duplicate environment variables instead of failing")
        .option("--hide-secret", 'Mask sensitive variables (replace with "********")')
        .option("--exclude-secret", "Exclude sensitive variables (do not show them at all)")
        .option("--include-comments", "Include comments in the export (does not work with the json format)")
        .option("-o, --out <file>", "Output file")
        .option("-f, --force", "Overwrite the existing file, in conjunction with -o or --out");
}

function addCommonExportHelpText(cmd: Command) {
    cmd.addHelpText("after", `\nDocs :\n  https://github.com/romaintaillandier1978/dotenv-never-lies/blob/main/docs/commands/export.md\n`);
    cmd.addHelpText(
        "after",
        `\nPlugin based : build your own exporter !\nDocs :\n  https://github.com/romaintaillandier1978/dotenv-never-lies/blob/main/docs/commands/export-plugins.md\n`
    );
}

async function registerExportCommands() {
    // Load all plugins, (internal and external)
    const exporters = await loaderExporters();
    // add common help text to docs
    const exportCmd = program.command("export");
    exportCmd.usage("<format> [options]");
    exportCmd.description("Export environment variables to various formats.\n");

    exportCmd.addHelpText("after", `\n${exporters.size} available export formats\n`);
    exportCmd.addHelpText(
        "after",
        `\nEach format is implemented as a subcommand and can be extended with custom plugins.
Use "dnl export <format> --help" for details on a specific format.\n
Examples:
  dnl export docker-args --out .env.docker
  dnl export json --source .env
`
    );
    addCommonExportHelpText(exportCmd);

    for (const exporter of exporters.values()) {
        // build cli for each sub command (one per format) !
        const sub = exportCmd.command(exporter.name).description(exporter.description ?? "");

        // add common options to all sub commands
        applyCommonExportOptions(sub);

        // register the command, i.e. apply the options and the help text
        exporter.register?.(sub);

        // add common help text to docs
        addCommonExportHelpText(sub);

        // add action to the command
        sub.action(async (opts) => {
            // execute the command
            const { content } = await exportCommand({
                ...opts,
                format: exporter.name,
                schema: program.opts().schema,
            });

            // print the content
            // TODO : check that.
            console.log(content);
        });
    }
}

// #endregion export

try {
    await registerExportCommands();

    await program.parseAsync(process.argv);
    process.exit(ExitCodes.success);
} catch (err: unknown) {
    // Commander throws a controlled error when help or version is displayed
    if (err instanceof CommanderError) {
        if (err.code === "commander.helpDisplayed" || err.code === "commander.version") {
            process.exit(ExitCodes.success);
        }
        process.exit(typeof err.exitCode === "number" ? err.exitCode : ExitCodes.usageError);
    }
    if (err instanceof ValidationError) {
        console.error("❌ Invalid environment variables:\n");

        for (const issue of err.issues ?? []) {
            console.error(`- ${issue.key}`);
            console.error(`  → ${issue.message}`);
        }

        process.exit(err.exitCode);
    }
    if (err instanceof ProcessEnvError) {
        process.exit(err.exitCode);
    }
    if (err instanceof DnlError) {
        console.error(err.message);
        process.exit(err.exitCode);
    }

    console.error("Unexpected error");
    console.error(err);
    process.exit(ExitCodes.usageError);
}
