import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { applySerializeTypedOption, getSource, getTypedOrRawValue } from "../shared.js";

export const jsExporter: DnlExporter = {
    name: "js",
    description: "Export source (.env or process.env) to a JavaScript object",
    register(cmd) {
        cmd = applySerializeTypedOption(cmd);
        return cmd;
    },
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
