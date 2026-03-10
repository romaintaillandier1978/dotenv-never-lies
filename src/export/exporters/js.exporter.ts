import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter, registerExporter } from "../registry.js";
import { getSource, getTypedOrRawValue } from "../shared.js";

export const jsExporter: DnlExporter = {
    name: "js",
    description: "JavaScript object",
    run(envDef, options, warnings) {
        return exportJs(envDef, options, warnings);
    },
};

const exportJs = (envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string => {
    const source = getSource(options, warnings);
    const values = envDef.assert({ source });

    const middle: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        if (options?.includeComments && envDef.def[key].description) {
            middle.push(`    // ${envDef.def[key].description}`);
        }

        middle.push(`    ${key}: ${JSON.stringify(getTypedOrRawValue(key, source, values, envDef, options), null, 2)},`);
    }

    return `export const env = {\n${middle.join("\n")}\n};`;
};

registerExporter(jsExporter);
