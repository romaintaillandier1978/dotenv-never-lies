import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { getRawValue } from "../shared.js";

export const gitlabEnvExporter: DnlExporter = {
    name: "gitlab-env",
    description: "Export source (.env or process.env) to GitLab CI environment variables",
    register(cmd) {
        cmd = cmd.addHelpText(
            "after",
            `\n# Generate variables for GitLab dotenv artifact
            dnl export gitlab-env --out variables.env
            `
        );
        return cmd;
    },
    run(envDef, validatedValues, source, options) {
        return exportGitlabEnv(envDef, validatedValues, source, options);
    },
};

const exportGitlabEnv = (
    envDef: EnvDefinitionHelper<EnvDefinition>,
    values: InferEnv<EnvDefinition>,
    source: EnvSource,
    options: ExportOptions
): string => {
    const args: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        if (options?.includeComments && envDef.def[key].description) {
            args.push(`# ${envDef.def[key].description}`);
        }
        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`${key}=${rawValue}`);
    }
    return args.join("\n");
};

registerExporter(gitlabEnvExporter);
