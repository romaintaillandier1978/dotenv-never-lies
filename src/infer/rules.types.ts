import { PressetDef } from "./presets.types.js";

export const exportKindNames = [
    "unknown",
    "array",
    "string",
    "number",
    "boolean",
    "port",
    "duration",
    "url",
    "email",
    "keyValue",
    "list",
    "json",
    "ip",
    "version",
    "enum",
] as const;

/**
 * The kind of inference, supported by DOTENV-NEVER-LIES
 */
export type InferKind = (typeof exportKindNames)[number];

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
export type GeneratedSchema<K extends InferKind = InferKind> = {
    /**
     * The kind of schema generated
     */
    kind: K;
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
export type InferResult<K extends InferKind = InferKind> = {
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
 * Meta data for an inference rule
 */
export type InferRuleMeta<K extends InferKind = InferKind> = {
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
export type InferRule<K extends InferKind = InferKind> = {
    /**
     * Meta data for an inference rule
     */
    meta: InferRuleMeta<K>;
    /**
     * Tries to infer a schema for the input.
     * Returns null if the rule does not apply at all.
     */
    // WARNING: do not change input type to InferContext.
    // Rules must remain pure and side-effect free.
    // Giving access to InferContext would allow rules to mutate global state (imports, warnings, reasons) before validation,
    // breaking inference determinism and test isolation.
    tryInfer(input: InferInput): InferResult<K> | null;
};

/**
 * Context for an inference
 */
export type InferContext = {
    /**
     * [IN] : Name of the .env entry
     */
    name: string;
    /**
     * [IN] : Raw value of the .env entry
     */
    rawValue: string;
    /**
     * [IN] : Presets that are used to infer the schema
     */
    presets?: Array<PressetDef>;
    /**
     * [OUT] : Imports to be added to the generated schema
     */
    imports: Array<Import>;
    /**
     * [OUT] : Reasons for infering to that particular type. (shown in verbose mode)
     */
    reasons: Array<string>;
    /**
     * [OUT] : Warnings as code comments, for that inference, to be injected in dnl schema. (not too much)
     */
    codeWarnings: Array<string>;
};

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
export type CrossRule = (context: CrossInferContext) => void;
