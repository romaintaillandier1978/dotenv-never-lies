import { zStringGenSchema } from "../generated/basic.js";
import { CrossRule, CrossInferContext } from "../types.js";

export const secretVsNonStringRule: CrossRule = (context: CrossInferContext): void => {
    if (context.isSecret && context.schema !== zStringGenSchema.code) {
        context.codeWarnings.push(` ⚠️ ${context.name} is a secret but was not inferred as a string.`);
    }
};
