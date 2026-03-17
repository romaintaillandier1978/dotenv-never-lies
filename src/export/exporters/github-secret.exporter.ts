import type { ExporterContext, ExportOptions } from "../export.types.js";
import { defineExporter } from "../export.types.js";

type GithubSecretExportOptions = ExportOptions & {
    githubOrg?: string;
};

export default defineExporter({
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
    run(ctx: ExporterContext<GithubSecretExportOptions>) {
        const { options, utils, variables, warnings } = ctx;
        if (options?.hideSecret) {
            warnings.push("The --hide-secret option is incompatible with github-secret");
        }
        const githubOrg: string | undefined = options?.githubOrg as string | undefined;
        if (githubOrg && githubOrg.includes(" ")) {
            warnings.push("github-org contains a space; gh command likely invalid");
        }
        const scopeFlag = githubOrg ? `--org ${utils.shellEscape(githubOrg)}` : "";

        const args: string[] = [];
        for (const variable of variables) {
            if (!variable.secret) continue;
            args.push(`printf '%s' ${utils.shellEscape(String(variable.value))} | gh secret set ${variable.key} ${scopeFlag} --body-file -`.trim());
        }

        return args.join("\n");
    },
});
