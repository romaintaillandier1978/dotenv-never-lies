import type { ExporterContext, ExportOptions } from "../export.types.js";
import { defineExporter } from "../export.types.js";
import { applySerializeTypedOption } from "../shared.js";

type TsExportOptions = ExportOptions & {
    serializeTyped?: boolean;
};

export default defineExporter({
    name: "ts",
    description: "Export source (.env or process.env) to a Typed TypeScript object",
    register(cmd) {
        cmd = applySerializeTypedOption(cmd);
        return cmd;
    },
    run(ctx: ExporterContext<TsExportOptions>) {
        const { options, variables } = ctx;
        console.log("options exportTs2 " + JSON.stringify(options, null, 2));
        const middle: string[] = [];
        for (const variable of variables) {
            if (variable.secret) {
                continue;
            }
            if (options?.includeComments && variable.description) {
                middle.push(`    // ${variable.description}`);
            }

            middle.push(`    ${variable.key}: ${JSON.stringify(variable.value, null, 4).replace(/\n/g, "\n    ")},`);
        }

        return `export const env = {\n${middle.join("\n")}\n} as const;`;
    },
});
