#!/usr/bin/env node

import { program, CommanderError } from "commander";
import { assertCommand } from "./commands/assert.js";
import { GenerateCliOptions, generateCommand } from "./commands/generate.js";
import { ReverseEnvCliOptions, reverseEnvCommand } from "./commands/reverseEnv.js";
import { explainCommand, printHuman } from "./commands/explain.js";
import { ExportCliOptions, exportCommand, ExportFormat } from "./commands/export.js";
import { toFile } from "./utils/toFile.js";
import { DnlError, ExitCodes, ValidationError } from "../errors.js";

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../../package.json") as { version: string };

const exitCodeHelp: { [key in ExitCodes]: string } = {
    [ExitCodes.success]: "Success (everything is valid, exit OK)",
    [ExitCodes.usageError]: "Usage error or internal error",
    [ExitCodes.schemaNotFound]: "DNL schema not found or not resolved",
    [ExitCodes.validationError]: "Validation failed (invalid environment)",
    [ExitCodes.exportError]: "Export error (format, file writing, secret, etc.)",
} as const;

// #region Program
program
    .name("dnl")
    //.version("0.3.0")
    .version(packageJson.version)
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
  dnl reverse-env --source .env
  
  # Display known variables and their description
  dnl explain

  # Export variables in docker-args format
  dnl export docker-args --source .env
  
    `
    );
// #endregion Program

// #region assert
program
    .command("assert")
    .description("Verifies the runtime environment and exits the process if the schema is not satisfied.")
    .option("-s, --source <source>", "Variables source (default: process.env)")
    .action(assertCommand)
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
    );
// #endregion assert

// #region export
const exportHelp: { [key in ExportFormat]: string } = {
    "docker-args": "Arguments `--env KEY=VALUE` for `docker run`",
    "docker-env": "File compatible with Docker `--env-file`",
    "github-env": "Inject into a GitHub Actions job environment",
    "github-secret": "GitHub Secrets via gh CLI (repo or organization)",
    "gitlab-env": "GitLab CI environment variables",
    "k8s-configmap": "Kubernetes ConfigMap (NON-sensitive variables)",
    "k8s-secret": "Kubernetes Secret (sensitive variables only)",
    env: ".env file cleaned (without unnecessary comments)",
    json: "Key/value JSON object",
    ts: "Typed TypeScript object",
    js: "JavaScript object",
} as const;

program
    .command("export")
    .description("Exports environment variables to a specified format. Variables are exported after being validated against the schema.")
    .argument("<format>", "Export format. See list and examples at the end")
    .option("-s, --source <source>", "Variables source (default: process.env if none provided)")
    .option("--hide-secret", 'Mask sensitive variables (replace with "********")')
    .option("--exclude-secret", "Exclude sensitive variables (do not show them at all)")
    .option("--include-comments", "Include comments in the export (does not work with the json format)")
    .option("--serialize-typed", "Serialize validated runtime values (js/ts/json only). See below for more details.")
    .option("-o, --out <file>", "Output file")
    .option("-f, --force", "Overwrite the existing file, in conjunction with -o or --out")
    .option("--k8s-name <name>", "Name for the k8s resource. Default: env-secret for k8s-secret, env-config for k8s-configmap")
    .option("--github-org <org>", "GitHub organization name")
    .action(async (format: ExportFormat, opts: Omit<ExportCliOptions, "format">) => {
        const { content, warnings, out } = await exportCommand({ ...opts, format });

        if (out) {
            await toFile(content, out, opts.force ?? false);
        } else {
            console.log(content);
        }
        for (const warning of warnings) {
            console.error(`${warning}`);
        }
    })
    .addHelpText(
        "after",
        `\nExport formats:\n${Object.entries(exportHelp)
            .map(([key, value]) => `  - ${key}: ${value}`)
            .join("\n")}
        `
    )
    .addHelpText(
        "after",
        `\nSerialize validated runtime values (js/ts/json only):
  When the --serialize-typed option is used, runtime values (after Zod transformations and validation) 
  are serialized instead of the raw (but still validated) values from the source (.env or process.env).

  Example:

  .env file:
  NODE_CORS_ORIGIN=https://a.site.com;https://b.site.com;https://c.site.com

  env.dnl.ts file:
  NODE_CORS_ORIGIN: {
      description: "Allowed frontend URLs separated by semicolons",
      schema: z.string().transform((v) =>
          v
              .split(";")
              .map((s) => s.trim())
              .filter(Boolean)
      ),
  },

  dnl export json --source .env 
  {
      "NODE_CORS_ORIGIN": "https://a.site.com;https://b.site.com;https://c.site.com"
  }
  
  dnl export json --source .env --serialize-typed
  {
      "NODE_CORS_ORIGIN": [
          "https://a.site.com",
          "https://b.site.com",
          "https://c.site.com"
      ]
  }

        `
    )
    .addHelpText(
        "after",
        `\nExamples:
      
  # --- Simple cases ----------------------------------------------------
  
  # Export environment variables as JSON from a .env file
  dnl export json --source .env
  
  # Clean a .env file (remove comments and extraneous lines)
  dnl export env --source .env --out .env.clean
  dnl export env --source .env -fo .env
  
  
  # --- Docker / CI ----------------------------------------------------
  
  # Export variables as docker-args
  dnl export docker-args --source .env
  
  # Concrete CI example to run a Docker container
  # (variables are injected dynamically)
  docker run \\
    $(dnl export docker-args --source $DOTENV_FILE) \\
    --restart always \\
    -d my-image:latest
  
  
  # --- GitHub Actions -------------------------------------------------
  
  # Export variables as GitHub secrets (current repo)
  # Requires gh CLI configured (gh auth login)
  dnl export github-secret
  
  # Export variables as GitHub organization secrets
  dnl export github-secret --github-org my-org
  
  # Example usage in a GitHub Actions job:
  # (variables are injected into the job environment)
  dnl export github-env >> $GITHUB_ENV
  
  
  # --- Kubernetes -----------------------------------------------------
  
  # Generate a Kubernetes ConfigMap (NON-sensitive variables), from process.env
  dnl export k8s-configmap --out k8s-configmap.yaml
  
  # Generate a Kubernetes Secret from a .env file
  dnl export k8s-secret --source .env --k8s-name my-secret --out k8s-secret.yaml
  
  # Apply the generated files
  kubectl apply -f k8s-configmap.yaml
  kubectl apply -f k8s-secret.yaml
  
  # note: if no secret is present in the dnl config, for k8s-secret the output will be empty
  
  # --- TypeScript / JavaScript ---------------------------------------
  
  # Export variables as a typed TypeScript object, or js
  dnl export ts --out env.generated.ts --serialize-typed
  dnl export js --out env.generated.js --serialize-typed
  `
    );
// #endregion export

// #region generate
program
    .command("generate")
    .description(
        "Generates a .env file from a DNL schema.\n" +
            "Useful to bootstrap a project or facilitate onboarding of a new developer.\n" +
            "Only default values defined in the schema are written."
    )
    .option("-o, --out <file>", "Output file (default: .env)")
    .option("-f, --force", "Overwrite existing file")
    .action(async (opts: GenerateCliOptions) => {
        const { content, out } = await generateCommand(opts);
        await toFile(content, out, opts.force ?? false);
    })
    .addHelpText(
        "after",
        `\nExamples:
        
  # Generate a .env file from the default schema (env.dnl.ts)
  dnl generate
  
  # Generate a .env file from a specified schema
  dnl generate --schema my-dnl.ts
  
  # Generate a .env.local file from the schema
  dnl generate --out .env.local
  
  # Generate a .env file from a schema and overwrite the existing file
  dnl generate --out .env --force
      `
    );
// #endregion generate

// #region reverse-env
program
    .command("reverse-env")
    .description(
        "Generates a dotenv-never-lies schema from a .env file.\n" +
            "Useful to migrate an existing project to dotenv-never-lies.\n" +
            "The generated schema is a starting point and must be refined manually.\n" +
            "Keys in the .env file that are not valid identifiers are escaped to JSON strings. (e.g. MY-KEY -> 'MY-KEY')"
    )
    .option("-s, --source <source>", "Source .env file", ".env")
    .option("-o, --out <file>", "Output DNL file", "env.dnl.ts")
    .option("-f, --force", "Overwrite existing file")
    .option("--guess-secret", "Try to guess sensitive variables (heuristic)")
    .action(async (opts: ReverseEnvCliOptions) => {
        const { content, out, warnings } = await reverseEnvCommand(opts);

        await toFile(content, out, opts.force ?? false);
        for (const warning of warnings) {
            console.error(`${warning}`);
        }
    })
    .addHelpText(
        "after",
        `\nExamples:
        
  # Generate an env.dnl.ts schema from a .env file, try to guess sensitive variables
  dnl reverse-env --guess-secret
  
  # Generate an env.dnl.ts schema from a .env.local file
  dnl reverse-env --source .env.local
  
  # Generate a my-dnl.ts schema from a .env file
  dnl reverse-env --out my-dnl.ts
  
  # Generate an env.dnl.ts schema from a .env file and overwrite the existing file
  dnl reverse-env --force 
  `
    );
// #endregion reverse-env

// #region explain
program
    .command("explain")
    .description("Displays the list of known environment variables and their description.")
    .argument("[keys...]", "Keys to explain (0..N). Without argument, all keys.")
    .option("-f, --format <format>", 'Output format ("human" | "json")', "human")
    .action(async (keys: string[] | undefined, opts: { schema?: string | undefined; format?: "human" | "json" | undefined }) => {
        const { format, result } = await explainCommand({ keys: keys ?? [], schema: opts.schema, format: opts.format });
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
    );
// #endregion explain

try {
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
    if (err instanceof DnlError) {
        console.error(err.message);
        process.exit(err.exitCode);
    }

    console.error("Unexpected error");
    console.error(err);
    process.exit(ExitCodes.usageError);
}
