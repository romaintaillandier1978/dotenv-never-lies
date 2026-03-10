import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter, registerExporter } from "../registry.js";
import { getRawValue, getSource } from "../shared.js";

export const k8sConfigmapExporter: DnlExporter = {
    name: "k8s-configmap",
    description: "Kubernetes ConfigMap (NON-sensitive variables)",
    run(envDef, options, warnings) {
        return exportK8sConfigmap(envDef, options, warnings);
    },
};

const exportK8sConfigmap = (envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string => {
    const source = getSource(options, warnings);
    const values = envDef.assert({ source });

    const args: string[] = [];
    args.push(`apiVersion: v1`);
    args.push(`kind: ConfigMap`);
    args.push(`metadata:`);
    const name = options?.k8sName ?? "env-config";
    args.push(`  name: ${name}`);
    args.push(`data:`);

    for (const key of Object.keys(values)) {
        if (envDef.def[key].secret) {
            if (options?.excludeSecret) continue;
            if (!options?.hideSecret) {
                warnings.push(`Secret ${key} exported in a ConfigMap. Use the k8s-secret format.`);
            }
        }

        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`  ${key}: ${JSON.stringify(rawValue)}`);
    }

    return args.join("\n");
};

registerExporter(k8sConfigmapExporter);
