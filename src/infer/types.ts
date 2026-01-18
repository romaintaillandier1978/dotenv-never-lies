/**
 * represent an import in a generated env.dnl.ts file
 */
export type Import = {
    /**
     * exact name of the element to import at the top of the generated env.dnl.ts file, ex: "jsonSchema"
     */
    name: string;
    /**
     * exact name of the package to import, ex: "@romaintaillandier1978/dotenv-never-lies"
     */
    from: string;
};

/**
 * represent a generated schema in a generated env.dnl.ts file, with associated import(s)
 * ex: {
 *     code: `jsonSchema("${name}")`,
 *     imports: [{ name: "jsonSchema", from: "@romaintaillandier1978/dotenv-never-lies" }]
 * }
 */
export type GeneratedSchema = {
    /**
     * The code that will be written in the dnl schema output, ex: "z.string()" or `jsonSchema("${name}")`
     */
    code: string;
    /**
     * What to import in dnl schema to support this schema. (set to [] to ignore zod imports.)
     */
    imports: Import[];
};

/**
 * Result of an inference
 */
export type InferResult = {
    /**
     * Generated code and imports
     */
    generated: GeneratedSchema;
    /**
     * Confidence level (0–10 typically)
     */
    confidence: number;
    /**
     * for verbose mode
     */
    reasons: string[];
    /**
     * for warnings, to inject in dnl schema. (not too much)
     */
    codeWarnings?: string[];
};

/**
 * Input for an inference or one .env entry
 */
export type InferInput = {
    /**
     * Name of the .env entry
     */
    name: string;
    /**
     * Raw value of the .env entry
     */
    rawValue: string;
};

/**
 * A reliable rule for an inference.
 */
export type InferRule = {
    /**
     * Logical identifier (json, boolean, duration, etc.)
     */
    type: string;

    /**
     * Global order (higher = higher priority)
     */
    priority: number;

    /**
     * Minimum threshold to accept this inference
     */
    threshold: number;

    /**
     * Tries to infer a schema for the input.
     * Returns null if the rule does not apply at all.
     */
    // WARNING: do not change input type to InferContext.
    // Rules must remain pure and side-effect free.
    // Giving access to InferContext would allow rules to mutate global state (imports, warnings, reasons) before validation,
    // breaking inference determinism and test isolation.
    tryInfer(input: InferInput): InferResult | null;
};

export type InferContext = {
    name: string;
    rawValue: string;
    imports: Array<Import>;
    reasons: Array<string>;
    codeWarnings: Array<string>;
};

export type CrossInferContext = InferContext & {
    schema: string;
    isSecret: boolean;
};

export type CrossRule = (context: CrossInferContext) => void;
