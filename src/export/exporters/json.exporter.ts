import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { getSource, getTypedOrRawValue } from "../shared.js";

export const exportJson = (envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string => {
    if (options?.includeComments) {
        warnings.push("The --include-comments option is ignored for the json format");
    }
    const source = getSource(options, warnings);
    const values = envDef.assert({ source });

    const args: Record<string, unknown> = {};
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        args[key] = getTypedOrRawValue(key, source, values, envDef, options);
    }
    return JSON.stringify(args, null, 2);
};
