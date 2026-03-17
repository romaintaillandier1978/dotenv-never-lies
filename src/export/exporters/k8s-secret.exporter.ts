import type { ExporterContext, ExportOptions } from "../export.types.js";
import { defineExporter } from "../export.types.js";

type K8sSecretExportOptions = ExportOptions & {
    k8sName?: string;
};

export default defineExporter({
    name: "k8s-secret",
    description: "Export source (.env or process.env) to a Kubernetes Secret (sensitive variables only)",

    register(cmd) {
        cmd = cmd.option("--k8s-name <name>", "Kubernetes secret name");
        cmd = cmd.addHelpText(
            "after",
            `\nExamples:
            
    # Generate a Kubernetes Secret from a .env file
    dnl export k8s-secret --source .env --k8s-name=my-secret --out k8s-secret.yaml
    
    # Apply the generated files
    kubectl apply -f k8s-secret.yaml

    # note: if no secret is present in the dnl config, for k8s-secret the output will be empty`
        );
        return cmd;
    },
    run(ctx: ExporterContext<K8sSecretExportOptions>) {
        const { options, variables } = ctx;
        const args: string[] = [];
        args.push(`apiVersion: v1`);
        args.push(`kind: Secret`);
        args.push(`type: Opaque`);
        args.push(`metadata:`);
        const k8sName = options.k8sName ?? "env-secret";
        args.push(`  name: ${k8sName}`);
        args.push(`stringData:`);

        for (const variable of variables) {
            if (!variable.secret) continue;

            args.push(`  ${variable.key}: ${JSON.stringify(variable.value)}`);
        }

        return args.join("\n");
    },
});
