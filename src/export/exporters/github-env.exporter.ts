import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { getRawValue, shellEscape } from "../shared.js";

export const githubEnvExporter: DnlExporter = {
    name: "github-env",
    description: "Export source (.env or process.env) to inject into a GitHub Actions job environment",
    run(envDef, validatedValues, source, options) {
        return exportGithubEnv(envDef, validatedValues, source, options);
    },
};

const exportGithubEnv = (
    envDef: EnvDefinitionHelper<EnvDefinition>,
    values: InferEnv<EnvDefinition>,
    source: EnvSource,
    options: ExportOptions
): string => {
    const args: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) continue;

        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`printf '%s\\n' ${shellEscape(`${key}=${rawValue}`)} >> "$GITHUB_ENV"`);
    }

    return args.join("\n");
};

registerExporter(githubEnvExporter);
