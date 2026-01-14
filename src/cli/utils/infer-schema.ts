import { RULES } from "../../infer/index.js";
import { Import } from "../../infer/types.js";

export const infer = (name: string, rawValue: string, imports: Array<Import>, verbose: Array<string>): string => {
    for (const pass of RULES) {
        const result = pass.tryInfer({ name, rawValue });

        if (!result) continue;

        if (result.confidence >= pass.threshold) {
            verbose.push(`  Infer ${name} : `);
            const importedNames = result.generated.imports.map((entry) => entry.name);
            verbose.push(`    [${importedNames.join(", ")}]  confidence: ${result.confidence} / threshold: ${pass.threshold}`);
            imports.push(...result.generated.imports);
            if (result.reasons) {
                verbose.push(...result.reasons.map((reason) => `    ${reason}`));
            }
            verbose.push(`    -> selected schema: ${result.generated.code}`);
            return result.generated.code;
        }
    }
    return "z.string()";
};
