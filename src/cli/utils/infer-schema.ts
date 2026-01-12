import { inferencePasses } from "../../infer-rules/index.js";

export const inferSchema = (name: string, rawValue: string, importedSchemas: Set<string>): string => {
    for (const pass of inferencePasses) {
        const result = pass.tryInfer({ name, rawValue });

        if (!result) continue;

        if (result.confidence >= pass.threshold) {
            if (result.importedSchema) {
                importedSchemas.add(result.importedSchema);
            }
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
