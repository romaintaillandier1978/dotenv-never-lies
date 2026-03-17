import type { ExporterContext, ExportOptions } from "../export.types.js";
import { defineExporter } from "../export.types.js";

export default defineExporter({
    name: "docker-args",
    description: "Export source (.env or process.env) as `--env KEY=VALUE` for `docker run`",
    register(cmd) {
        cmd = cmd.addHelpText(
            "after",
            `\nExamples:
            
    # Export variables in docker-args format
    dnl export docker-args --source .env
    
    # Concrete CI example to run a Docker container (variables are injected dynamically)
    docker run \\
      $(dnl export docker-args --source $DOTENV_FILE) \\
      --restart always \\
      -d my-image:latest
    `
        );
        return cmd;
    },

    run(ctx: ExporterContext<ExportOptions>) {
        const { options, utils, variables, warnings } = ctx;
        if (options?.includeComments) {
            warnings.push("The --include-comments option is invalid with the docker-args format");
        }
        const args: string[] = [];
        for (const variable of variables) {
            if (variable.secret) {
                continue;
            }
            args.push(`-e ${utils.shellEscape(`${variable.key}=${variable.value}`)}`);
        }
        return args.join(" ");
    },
});
