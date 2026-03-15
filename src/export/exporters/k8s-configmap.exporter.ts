import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { getRawValue, getSource } from "../shared.js";

type K8sConfigmapExportOptions = ExportOptions & {
    k8sName?: string;
};

export const k8sConfigmapExporter: DnlExporter = {
    name: "k8s-configmap",
    description: "Export source (.env or process.env) to a Kubernetes ConfigMap (NON-sensitive variables)",
    register(cmd) {
        cmd = cmd.option("--k8s-name <name>", "Kubernetes configmap name");
        cmd = cmd.addHelpText(
            "after",
            `\nExamples:
            
    # Generate a Kubernetes ConfigMap (NON-sensitive variables), from process.env
    dnl export k8s-configmap --out k8s-configmap.yaml
    
    # Apply the generated files
    kubectl apply -f k8s-configmap.yaml

    `
        );
        return cmd;
    },
    run(envDef, options, warnings) {
        return exportK8sConfigmap(envDef, options, warnings);
    },
};

const exportK8sConfigmap = (envDef: EnvDefinitionHelper<EnvDefinition>, options: K8sConfigmapExportOptions, warnings: string[]): string => {
    const source = getSource(options, warnings);
    const values = envDef.assert({ source });

    const args: string[] = [];
    args.push(`apiVersion: v1`);
    args.push(`kind: ConfigMap`);
    args.push(`metadata:`);

    const k8sName = options?.k8sName ?? "env-configmap";
    args.push(`  name: ${k8sName}`);
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
