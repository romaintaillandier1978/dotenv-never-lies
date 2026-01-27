import { CrossRule, CrossInferContext } from "../infer.types.js";

export const secretVsNonStringRule: CrossRule = (context: CrossInferContext): void => {
    if (context.isSecret && context.inferredSchema.kind !== "string") {
        context.codeWarnings.push(` ⚠️ ${context.name} is a secret but was not inferred as a string.`);
    }
};
