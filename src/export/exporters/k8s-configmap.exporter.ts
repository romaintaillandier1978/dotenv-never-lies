import type { ExporterContext, ExportOptions } from "../export.types.js";
import { defineExporter } from "../export.types.js";

type K8sConfigmapExportOptions = ExportOptions & {
    k8sName?: string;
};

export default defineExporter({
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

    run(ctx: ExporterContext<K8sConfigmapExportOptions>) {
        const { options, variables, warnings } = ctx;
        const args: string[] = [];
        args.push(`apiVersion: v1`);
        args.push(`kind: ConfigMap`);
        args.push(`metadata:`);

        const k8sName = options?.k8sName ?? "env-configmap";
        args.push(`  name: ${k8sName}`);
        args.push(`data:`);

        for (const variable of variables) {
            if (variable.secret) {
                if (!options?.hideSecret) {
                    warnings.push(`Secret ${variable.key} exported in a ConfigMap. Use the k8s-secret format.`);
                }
            }

            args.push(`  ${variable.key}: ${JSON.stringify(variable.value)}`);
        }

        return args.join("\n");
    },
});
