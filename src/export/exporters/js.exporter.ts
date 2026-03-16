import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { applySerializeTypedOption, getTypedOrRawValue } from "../shared.js";

export const jsExporter: DnlExporter = {
    name: "js",
    description: "Export source (.env or process.env) to a JavaScript object",
    register(cmd) {
        cmd = applySerializeTypedOption(cmd);
        return cmd;
    },
    run(envDef, validatedValues, source, options) {
        return exportJs(envDef, validatedValues, source, options);
    },
};

const exportJs = (
    envDef: EnvDefinitionHelper<EnvDefinition>,
    values: InferEnv<EnvDefinition>,
    source: EnvSource,
    options: ExportOptions
): string => {
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
