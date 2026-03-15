import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { getRawValue, getSource, shellEscape } from "../shared.js";

type GithubSecretExportOptions = ExportOptions & {
    githubOrg?: string;
};

export const githubSecretExporter: DnlExporter = {
    name: "github-secret",
    description: "Export source (.env or process.env) to GitHub Secrets via gh CLI (repo or organization)",
    // help: `      # Export variables as GitHub secrets (current repo)
    //   # Requires gh CLI configured (gh auth login)
    //   dnl export github-secret

    //   # Export variables as GitHub organization secrets
    //   dnl export github-secret --github-org=my-org`,
    register(cmd) {
        cmd = cmd.option("--github-org <org>", "GitHub organization");
        cmd = cmd.addHelpText(
            "after",
            `\n# Requires gh CLI configured (gh auth login)
    dnl export github-secret

    # Export variables as GitHub secrets (current repo)
    dnl export github-secret --github-org=my-org
    `
        );
        return cmd;
    },
    run(envDef, options, warnings) {
        return exportGithubSecret(envDef, options, warnings);
    },
};

const exportGithubSecret = (envDef: EnvDefinitionHelper<EnvDefinition>, options: GithubSecretExportOptions, warnings: string[]): string => {
    if (options?.hideSecret) {
        warnings.push("The --hide-secret option is incompatible with github-secret");
    }
    const githubOrg: string | undefined = options?.githubOrg as string | undefined;
    if (githubOrg && githubOrg.includes(" ")) {
        warnings.push("github-org contains a space; gh command likely invalid");
    }
    const source = getSource(options, warnings);
    const values = envDef.assert({ source });

    const scopeFlag = githubOrg ? `--org ${shellEscape(githubOrg)}` : "";

    const args: string[] = [];
    for (const key of Object.keys(values)) {
        if (!envDef.def[key].secret) continue;
        if (options?.excludeSecret) continue;
        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`printf '%s' ${shellEscape(rawValue)} | gh secret set ${key} ${scopeFlag} --body-file -`.trim());
    }

    return args.join("\n");
};

registerExporter(githubSecretExporter);
