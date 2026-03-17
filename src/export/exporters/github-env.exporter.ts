import type { ExporterContext, ExportOptions } from "../export.types.js";
import { defineExporter } from "../export.types.js";

export default defineExporter({
    name: "github-env",
    description: "Export source (.env or process.env) to inject into a GitHub Actions job environment",
    run(ctx: ExporterContext<ExportOptions>) {
        const { variables, utils } = ctx;
        const args: string[] = [];
        for (const variable of variables) {
            if (variable.secret) continue;

            args.push(`printf '%s\\n' ${utils.shellEscape(`${variable.key}=${variable.value}`)} >> "$GITHUB_ENV"`);
        }

        return args.join("\n");
    },
});
