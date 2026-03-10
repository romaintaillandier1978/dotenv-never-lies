import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter, registerExporter } from "../registry.js";
import { getRawValue, getSource, shellEscape } from "../shared.js";

export const dockerArgsExporter: DnlExporter = {
    name: "docker-args",
    description: "Arguments `--env KEY=VALUE` for `docker run`",
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
