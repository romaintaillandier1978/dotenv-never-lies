import { RULES } from "../../infer/index.js";

export const infer = (name: string, rawValue: string, importedSchemas: Set<string>, verbose: Array<string>): string => {
    for (const pass of RULES) {
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
