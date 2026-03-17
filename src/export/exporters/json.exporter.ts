import type { ExporterContext, ExportOptions } from "../export.types.js";
import { defineExporter } from "../export.types.js";
import { applySerializeTypedOption } from "../shared.js";

type JsonExportOptions = ExportOptions & {
    serializeTyped?: boolean;
};
export default defineExporter({
    name: "json",
    description: "Export source (.env or process.env) to a Key/value JSON object",
    register(cmd) {
        return applySerializeTypedOption(cmd);
    },
    run(ctx: ExporterContext<JsonExportOptions>) {
        const { variables } = ctx;
        const args: Record<string, unknown> = {};
        for (const variable of variables) {
            if (variable.secret) {
                continue;
            }
            args[variable.key] = variable.value;
        }
        return JSON.stringify(args, null, 2);
    },
});
