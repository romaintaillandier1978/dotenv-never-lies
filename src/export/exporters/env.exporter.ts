import type { ExporterContext, ExportOptions } from "../export.types.js";
import { defineExporter } from "../export.types.js";

export default defineExporter({
    name: "env",
    description: "Export source (.env or process.env) to another .env file cleaned (without unnecessary comments)",
    run(ctx: ExporterContext<ExportOptions>) {
        const { options, variables } = ctx;
        const result: string[] = [];
        for (const variable of variables) {
            if (variable.secret) {
                continue;
            }
            if (options?.includeComments && variable.description) {
                result.push(`# ${variable.description}`);
            }
            result.push(`${variable.key}=${variable.value}`);
        }
        return result.join("\n");
    },
});
