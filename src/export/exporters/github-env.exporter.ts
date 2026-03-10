import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter, registerExporter } from "../registry.js";
import { getRawValue, getSource, shellEscape } from "../shared.js";

export const githubEnvExporter: DnlExporter = {
    name: "github-env",
    description: "Inject into a GitHub Actions job environment",
    run(envDef, options, warnings) {
        return exportGithubEnv(envDef, options, warnings);
    },
};

const exportGithubEnv = (envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string => {
    const source = getSource(options, warnings);
    const values = envDef.assert({ source });

    const args: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) continue;

        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`printf '%s\\n' ${shellEscape(`${key}=${rawValue}`)} >> "$GITHUB_ENV"`);
    }

    return args.join("\n");
};

registerExporter(githubEnvExporter);
