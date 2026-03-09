import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { getRawValue, getSource, shellEscape } from "../shared.js";

export const exportGithubSecret = (envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string => {
    if (options?.hideSecret) {
        warnings.push("The --hide-secret option is incompatible with github-secret");
    }
    if (options?.githubOrg && options.githubOrg.includes(" ")) {
        warnings.push("github-org contains a space; gh command likely invalid");
    }
    const source = getSource(options, warnings);
    const values = envDef.assert({ source });

    const scopeFlag = options?.githubOrg ? `--org ${shellEscape(options.githubOrg)}` : "";

    const args: string[] = [];
    for (const key of Object.keys(values)) {
        if (!envDef.def[key].secret) continue;
        if (options?.excludeSecret) continue;
        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`printf '%s' ${shellEscape(rawValue)} | gh secret set ${key} ${scopeFlag} --body-file -`.trim());
    }

    return args.join("\n");
};
