import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter, registerExporter } from "../registry.js";
import { getRawValue, getSource } from "../shared.js";

export const dockerEnvExporter: DnlExporter = {
    name: "docker-env",
    description: "Export variables to a .env file compatible with `docker run --env-file`",
    run(envDef, options, warnings) {
        return exportDockerEnv(envDef, options, warnings);
    },
};

const exportDockerEnv = (envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string => {
    const source = getSource(options, warnings);
    const values = envDef.assert({ source });
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
