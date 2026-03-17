import type { ExporterContext, ExportOptions } from "../export.types.js";
import { defineExporter } from "../export.types.js";

export default defineExporter({
    name: "gitlab-env",
    description: "Export source (.env or process.env) to GitLab CI environment variables",
    register(cmd) {
        cmd = cmd.addHelpText(
            "after",
            `\n# Generate variables for GitLab dotenv artifact
            dnl export gitlab-env --out variables.env
            `
        );
        return cmd;
    },
    run(ctx: ExporterContext<ExportOptions>) {
        const { options, utils, variables } = ctx;
        const args: string[] = [];
        for (const variable of variables) {
            if (variable.secret) {
                continue;
            }
            if (options?.includeComments && variable.description) {
                args.push(`# ${variable.description}`);
            }
            args.push(`${variable.key}=${utils.shellEscape(String(variable.value))}`);
        }
        return args.join("\n");
    },
});
