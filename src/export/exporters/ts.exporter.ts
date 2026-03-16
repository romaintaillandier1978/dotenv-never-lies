import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { applySerializeTypedOption, getTypedOrRawValue } from "../shared.js";

type TsExportOptions = ExportOptions & {
    serializeTyped?: boolean;
};
export const tsExporter: DnlExporter = {
    name: "ts",
    description: "Export source (.env or process.env) to a Typed TypeScript object",
    register(cmd) {
        cmd = applySerializeTypedOption(cmd);
        return cmd;
    },
    run(envDef, validatedValues, source, options) {
        return exportTs(envDef, validatedValues, source, options);
    },
};

const exportTs = (envDef: EnvDefinitionHelper<EnvDefinition>, values: InferEnv<EnvDefinition>, source: EnvSource, options: TsExportOptions): string => {
    const middle: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        if (options?.includeComments && envDef.def[key].description) {
            middle.push(`    // ${envDef.def[key].description}`);
        }

        // TODO : better spacing ?
        middle.push(`    ${key}: ${JSON.stringify(getTypedOrRawValue(key, source, values, envDef, options), null, 8)},`);
    }

    return `export const env = {\n${middle.join("\n")}\n} as const;`;
};

registerExporter(tsExporter);
