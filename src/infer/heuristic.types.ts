import { GeneratedSchema, InferInput, InferKind } from "./infer.types.js";

/**
 * Result of an inference
 */
export type HeuristicResult<K extends InferKind = InferKind> = {
    /**
     * Generated code and imports
     */
    generated: GeneratedSchema<K>;
    /**
     * Confidence level (0–10 typically)
     */
    confidence: number;
    /**
     * for verbose mode
     */
    reasons: Array<string>;
    /**
     * for warnings, to inject in dnl schema. (not too much)
     */
    codeWarnings?: Array<string>;
};

/**
 * Meta data for an inference rule
 */
export type HeuristicRuleMeta<K extends InferKind = InferKind> = {
    /**
     * Logical identifier (json, boolean, duration, etc.)
     */
    kind: K;

    /**
     * Global order (higher = higher priority)
     */
    priority: number;

    /**
     * Minimum threshold to accept this inference
     */
    threshold: number;
};
/**
 * A reliable rule for an inference.
 */
export type HeuristicRule<K extends InferKind = InferKind> = {
    /**
     * Meta data for an inference rule
     */
    meta: HeuristicRuleMeta<K>;
    /**
     * Tries to infer a schema for the input.
     * Returns null if the rule does not apply at all.
     */
    // WARNING: do not change input type to InferContext.
    // Rules must remain pure and side-effect free.
    // Giving access to InferContext would allow rules to mutate global state (imports, warnings, reasons) before validation,
    // breaking inference determinism and test isolation.
    tryInfer(input: InferInput): HeuristicResult<K> | null;
};
