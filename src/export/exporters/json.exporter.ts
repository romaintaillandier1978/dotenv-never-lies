import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { applySerializeTypedOption, getTypedOrRawValue } from "../shared.js";

export const jsonExporter: DnlExporter = {
    name: "json",
    description: "Export source (.env or process.env) to a Key/value JSON object",
    register(cmd) {
        return applySerializeTypedOption(cmd);
    },
    run(envDef, validatedValues, source, options) {
        return exportJson(envDef, validatedValues, source, options);
    },
};

const exportJson = (
    envDef: EnvDefinitionHelper<EnvDefinition>,
    values: InferEnv<EnvDefinition>,
    source: EnvSource,
    options: ExportOptions
): string => {
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
