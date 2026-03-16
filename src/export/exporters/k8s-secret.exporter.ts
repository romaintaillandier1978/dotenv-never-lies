import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter } from "../export.types.js";
import { registerExporter } from "../registry.js";
import { getRawValue } from "../shared.js";

type K8sSecretExportOptions = ExportOptions & {
    k8sName?: string;
};

export const k8sSecretExporter: DnlExporter = {
    name: "k8s-secret",
    description: "Export source (.env or process.env) to a Kubernetes Secret (sensitive variables only)",
    // help: `    # Generate a Kubernetes Secret from a .env file
    // dnl export k8s-secret --source .env --k8s-name=my-secret --out k8s-secret.yaml

    // # Apply the generated files
    // kubectl apply -f k8s-secret.yaml

    // # note: if no secret is present in the dnl config, for k8s-secret the output will be empty`,
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
    run(envDef, validatedValues, source, options) {
        return exportK8sSecret(envDef, validatedValues, source, options);
    },
};

const exportK8sSecret = (
    envDef: EnvDefinitionHelper<EnvDefinition>,
    values: InferEnv<EnvDefinition>,
    source: EnvSource,
    options: K8sSecretExportOptions
): string => {
    const args: string[] = [];
    args.push(`apiVersion: v1`);
    args.push(`kind: Secret`);
    args.push(`type: Opaque`);
    args.push(`metadata:`);
    const k8sName = options?.k8sName ?? "env-secret";
    args.push(`  name: ${k8sName}`);
    args.push(`stringData:`);

    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) continue;
        if (!envDef.def[key].secret) continue;

        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`  ${key}: ${JSON.stringify(rawValue)}`);
    }

    return args.join("\n");
};

registerExporter(k8sSecretExporter);
