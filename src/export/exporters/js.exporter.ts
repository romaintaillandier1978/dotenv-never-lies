import type { ExporterContext, ExportOptions } from "../export.types.js";
import { defineExporter } from "../export.types.js";
import { applySerializeTypedOption } from "../shared.js";

export default defineExporter({
    name: "js",
    description: "Export source (.env or process.env) to a JavaScript object",
    register(cmd) {
        cmd = applySerializeTypedOption(cmd);
        return cmd;
    },
    run(ctx: ExporterContext<ExportOptions>) {
        const { options, variables } = ctx;
        const middle: string[] = [];
        for (const variable of variables) {
            if (variable.secret) {
                continue;
            }
            if (options?.includeComments && variable.description) {
                middle.push(`    // ${variable.description}`);
            }

            middle.push(`    ${variable.key}: ${JSON.stringify(variable.value, null, 2)},`);
        }

        return `export const env = {\n${middle.join("\n")}\n};`;
    },
});
