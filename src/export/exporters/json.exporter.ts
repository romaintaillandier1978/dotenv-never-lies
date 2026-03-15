import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter, registerExporter } from "../registry.js";
import { applySerializeTypedOption, getSource, getTypedOrRawValue } from "../shared.js";

export const jsonExporter: DnlExporter = {
    name: "json",
    description: "Export source (.env or process.env) to a Key/value JSON object",
    register(cmd) {
        return applySerializeTypedOption(cmd);
    },
    run(envDef, options, warnings) {
        return exportJson(envDef, options, warnings);
    },
};

const exportJson = (envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string => {
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

registerExporter(jsonExporter);
