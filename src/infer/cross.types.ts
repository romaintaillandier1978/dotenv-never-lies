import { GeneratedSchema, InferContext } from "./infer.types.js";

/**
 * Context for a cross-rule inference
 */
export type CrossInferContext = InferContext & {
    /**
     * inferred schema of the .env entry
     */
    inferredSchema: GeneratedSchema;
    /**
     * Whether the .env entry is a secret
     * (used by cross-rules)
     */
    isSecret: boolean;
};

/**
 * A cross-rule for an inference.
 */
export type CrossRule = (context: CrossInferContext) => CrossResult | null;

export type CrossResult = {
    /**
     * Reasons for infering to that particular type. (shown in verbose mode)
     */
    reasons: Array<string>;
    /**
     * Warnings to inject in dnl schema. (not too much)
     */
    codeWarnings?: Array<string>;
};
