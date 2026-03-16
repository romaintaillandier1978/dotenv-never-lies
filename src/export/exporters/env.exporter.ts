import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { getRawValue } from "../shared.js";

export const envExporter: DnlExporter = {
    name: "env",
    description: "Export source (.env or process.env) to another .env file cleaned (without unnecessary comments)",
    run(envDef, validatedValues, source, options) {
        return exportEnv(envDef, validatedValues, source, options);
    },
};

export const exportEnv = (
    envDef: EnvDefinitionHelper<EnvDefinition>,
    values: InferEnv<EnvDefinition>,
    source: EnvSource,
    options: ExportOptions
): string => {
    const result: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        if (options?.includeComments && envDef.def[key].description) {
            result.push(`# ${envDef.def[key].description}`);
        }
        const rawValue = getRawValue(key, source, envDef, options);
        result.push(`${key}=${rawValue}`);
    }
    return result.join("\n");
};

registerExporter(envExporter);
