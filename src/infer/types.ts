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
     * Optional, for debug / warnings / verbose
     */
    reasons?: string[];
};

export type InferInput = {
    name: string;
    rawValue: string;
};

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
     * Tries an inference.
     * Returns null if the rule does not apply at all.
     */
    tryInfer(input: InferInput): InferResult | null;
};
