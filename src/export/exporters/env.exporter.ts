import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter, registerExporter } from "../registry.js";
import { getRawValue, getSource } from "../shared.js";

export const envExporter: DnlExporter = {
    name: "env",
    description: "Export source (.env or process.env) to another .env file cleaned (without unnecessary comments)",
    run(envDef, options, warnings) {
        return exportEnv(envDef, options, warnings);
    },
};

export const exportEnv = (envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string => {
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

registerExporter(envExporter);
