import { defineExporter, ExporterContext, ExportOptions } from "../export.types.js";

export default defineExporter({
    name: "docker-env",
    description: "Export variables to a .env file compatible with `docker run --env-file`",

    run(ctx: ExporterContext<ExportOptions>) {
        const { options, variables } = ctx;
        const args: string[] = [];

        for (const variable of variables) {
            if (variable.secret) {
                continue;
            }
            if (options?.includeComments && variable.description) {
                args.push(`# ${variable.description}`);
            }

            args.push(`${variable.key}=${variable.value}`);
        }
        return args.join("\n");
    },
});
