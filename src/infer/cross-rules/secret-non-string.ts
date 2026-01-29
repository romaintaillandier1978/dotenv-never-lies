import { CrossInferContext, CrossResult } from "../cross.types.js";
import { CrossRule } from "../cross.types.js";

export const secretVsNonStringRule: CrossRule = (context: CrossInferContext): CrossResult | null => {
    if (!context.isSecret || context.inferredSchema.kind === "string") return null;

    return {
        reasons: [`${context.name} is a secret but was not inferred as a string.`],
        codeWarnings: [`⚠️ ${context.name} is a secret but was not inferred as a string.`],
    };
};
