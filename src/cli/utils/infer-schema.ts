import { inferencePasses, listInferencePasses } from "../../infer-rules/index.js";

export const inferSchema = (name: string, rawValue: string, importedSchemas: Set<string>, verbose: Array<string>): string => {
    for (const pass of inferencePasses) {
        const result = pass.tryInfer({ name, rawValue });

        if (!result) continue;

        if (result.confidence >= pass.threshold) {
            verbose.push(`  Infer ${name} : `);
            verbose.push(`    [${result.importedSchemas}]  confidence: ${result.confidence} / threshold: ${pass.threshold}`);
            if (result.importedSchemas) {
                result.importedSchemas.forEach((schema) => importedSchemas.add(schema));
            }
            if (result.reasons) {
                verbose.push(...result.reasons.map((reason) => `    ${reason}`));
            }
            verbose.push(`    -> selected schema: ${result.schema}`);
            return result.schema;
        }
    }
    return "z.string()";
};

export const inferSimpleSchemaForListItem = (name: string, rawValue: string) => {
    for (const pass of listInferencePasses) {
        const result = pass.tryInfer({ name, rawValue });

        if (!result) continue;

        if (result.confidence >= pass.threshold) {
            return result.schema;
        }
    }

    return "z.string()";
};

const secretMarkers = ["SECRET", "KEY", "TOKEN", "PASSWORD", "PASS", "AUTH"];

export const guessSecret = (value: string) => {
    const parts = value.toUpperCase().split(/[_\-]/);
    return secretMarkers.some((marker) => parts.includes(marker));
};
