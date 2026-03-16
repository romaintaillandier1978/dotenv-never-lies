import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { getRawValue } from "../shared.js";

export const dockerEnvExporter: DnlExporter = {
    name: "docker-env",
    description: "Export variables to a .env file compatible with `docker run --env-file`",
    run(envDef, validatedValues, source, options) {
        return exportDockerEnv(envDef, validatedValues, source, options);
    },
};

const exportDockerEnv = (
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

registerExporter(dockerEnvExporter);
