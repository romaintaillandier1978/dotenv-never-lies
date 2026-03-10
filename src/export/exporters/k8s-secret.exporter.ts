import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { DnlExporter, registerExporter } from "../registry.js";
import { getRawValue, getSource } from "../shared.js";

export const k8sSecretExporter: DnlExporter = {
    name: "k8s-secret",
    description: "Kubernetes Secret (sensitive variables only)",
    run(envDef, options, warnings) {
        return exportK8sSecret(envDef, options, warnings);
    },
};

const exportK8sSecret = (envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string => {
    const source = getSource(options, warnings);
    const values = envDef.assert({ source });

    const args: string[] = [];
    args.push(`apiVersion: v1`);
    args.push(`kind: Secret`);
    args.push(`type: Opaque`);
    args.push(`metadata:`);
    const name = options?.k8sName ?? "env-secret";
    args.push(`  name: ${name}`);
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
