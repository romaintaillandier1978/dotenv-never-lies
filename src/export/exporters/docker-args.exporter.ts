import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { getRawValue, getSource, shellEscape } from "../shared.js";

export const dockerArgsExporter: DnlExporter = {
    name: "docker-args",
    description: "Export source (.env or process.env) as `--env KEY=VALUE` for `docker run`",
    //     help: `# Export variables as docker-args
    //       dnl export docker-args --source .env
    //       # Concrete CI example to run a Docker container
    //       # (variables are injected dynamically)
    //       docker run \\
    //         $(dnl export docker-args --source $DOTENV_FILE) \\
    //         --restart always \\
    //         -d my-image:latest
    // `,
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
    run(envDef, options, warnings) {
        return exportDockerArgs(envDef, options, warnings);
    },
};

const exportDockerArgs = (envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string => {
    if (options?.includeComments) {
        warnings.push("The --include-comments option is invalid with the docker-args format");
    }
    const source = getSource(options, warnings);
    const values = envDef.assert({ source });
    const args: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`-e ${shellEscape(`${key}=${rawValue}`)}`);
    }
    return args.join(" ");
};

registerExporter(dockerArgsExporter);
