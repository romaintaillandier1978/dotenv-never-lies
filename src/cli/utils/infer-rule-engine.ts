import { zStringGenSchema } from "../../infer/generated/basic.js";
import { CROSS_RULES, RULES } from "../../infer/rules.js";
import { CrossInferContext, GeneratedSchema, InferContext } from "../../infer/rules.types.js";

export const infer = (context: InferContext): GeneratedSchema => {
    
    
    // for each rules, 
    for (const rule of RULES) {

        // try to infer a schema for the current context
        const result = rule.tryInfer({ name: context.name, rawValue: context.rawValue });

        if (!result) continue;

        if (result.confidence >= rule.threshold) {
            context.reasons.push(`  Infer ${context.name} : `);
            const importedNames = result.generated.imports.map((entry) => entry.name);
            context.reasons.push(`    [${importedNames.join(", ")}]  confidence: ${result.confidence} / threshold: ${rule.threshold}`);
            context.imports.push(...result.generated.imports);
            if (result.reasons) {
                context.reasons.push(...result.reasons.map((reason) => `    ${reason}`));
            }
            context.reasons.push(`    -> selected schema: ${result.generated.code}`);
            if (result.codeWarnings) {
                context.codeWarnings.push(...result.codeWarnings);
            }
            return result.generated;
        }
    }
    return zStringGenSchema;
};

export const crossInfer = (context: CrossInferContext): void => {
    for (const rule of CROSS_RULES) {
        rule(context);
    }
};
