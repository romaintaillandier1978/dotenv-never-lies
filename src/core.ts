import { z } from "zod";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { DnlError, ExitCodes } from "./errors.js";
import fs from "fs";
import { Simplify } from "type-fest";

/**
 * An object containing environment variables as strings, coming from a .env file or from process.env.
 */
export type EnvSource = Record<string, string | undefined>;

/**
 * An environment variable.
 */
export type EnvVarDefinition<T extends z.ZodType = z.ZodType> = Simplify<{
    // export interface EnvVarDefinition<T extends z.ZodType = z.ZodType, M = unknown> {
    /**
     * The Zod schema of the environment variable.
     */
    schema: T;
    /**
     * The description of the environment variable.
     */
    description: string;
    /**
     * Whether the environment variable is secret (for tokens, passwords), reserved for future use (RFU).
     */
    secret?: boolean;
    /**
     * Provides examples for this variable.
     */
    examples?: string[];
    // /**
    //  * User metadata for this variable. DNL NEVER USE THIS FIELD.
    //  */
    // metadata?: M;
}>;

// any is required here to leverage TypeScript inference.
//export type EnvDefinition = Record<string, EnvVarDefinition<any>>;
// TODO : Vérifier si ca marche toujours avec z.ZodType vs any
/**
 * An object containing the defined environment variables.
 */
export type EnvDefinition = Record<string, EnvVarDefinition<z.ZodType>>;

/**
 * The Zod shape of the environment schema.
 */
export type ZodShapeFromEnv<T extends EnvDefinition> = {
    [K in keyof T & string]: T[K]["schema"];
};
/**
 * The inferred type of the environment schema.
 */
export type InferEnv<T extends EnvDefinition> = Simplify<{
    [K in keyof T & string]: z.infer<T[K]["schema"]>;
}>;

type CheckFn = (options?: { source?: EnvSource | undefined }) => boolean;
type AssertFn<T extends EnvDefinition> = (options?: { source?: EnvSource | undefined }) => InferEnv<T>;

/**
 * An object containing functions to check and assert environment variables.
 * @template T - The environment schema to define.
 */
export type EnvDefinitionHelper<T extends EnvDefinition> = {
    /**
     * The defined environment schema.
     */
    def: T;
    /**
     * The Zod shape of the environment schema.
     */
    zodShape: ZodShapeFromEnv<T>;
    /**
     * The Zod schema of the environment schema.
     */
    zodSchema: z.ZodObject<ZodShapeFromEnv<T>>;
    /**
     * Checks whether the environment variables are valid without throwing.
     *
     * If `options.source` is provided, it is used with strict mode (zod.strict()).
     * Otherwise, `process.env` is used in non-strict mode.
     *
     * @param options - Options to check the environment variables.
     * @returns true if the environment variables are valid, false otherwise.
     */
    check: CheckFn;
    /**
     * Validates the environment variables and throws if they do not conform to the schema.
     *
     * If `options.source` is provided, it is used with strict mode (zod.strict()).
     * Otherwise, `process.env` is used in non-strict mode.
     *
     * @param options - Options to load the environment variables.
     * @returns The loaded environment variables.
     * @throws If the environment variables are invalid.
     */
    assert: AssertFn<T>;
};

/**
 * Defines an environment schema.
 * @param def - The environment schema to define.
 * @returns An object exposing functions to check and assert environment variables.
 */
export const define = <T extends EnvDefinition>(def: T): EnvDefinitionHelper<T> => {
    const zodShape = Object.fromEntries(Object.entries(def).map(([key, value]) => [key, value.schema])) as ZodShapeFromEnv<T>;
    const zodSchema: z.ZodObject<ZodShapeFromEnv<T>> = z.object(zodShape);
    const strictSchema = zodSchema.strict();

    const extractParams = (options?: { source?: EnvSource | undefined }): { source: EnvSource; strict: boolean } => {
        const source = options?.source ?? process.env;
        const strict = source !== process.env;
        return { source, strict };
    };
    const getSchema = (strict: boolean) => (strict ? strictSchema : zodSchema);

    const check: CheckFn = (options): boolean => {
        const { source, strict } = extractParams(options);
        return getSchema(strict).safeParse(source).success;
    };

    const assert: AssertFn<T> = (options) => {
        const { source, strict } = extractParams(options);
        return getSchema(strict).parse(source) as InferEnv<T>;
    };

    return { def, zodShape, zodSchema, check, assert };
};

export type ReadEnvFileOptions = { onDuplicate: "warn" | "error" };

/**
 * Reads a .env file and returns environment variables as an object.
 * Uses dotenv and dotenv-expand.
 * @example
 * ```typescript
 * const ENV = envDefinition.load({ source: readEnvFile(".env") });
 * ```
 * @param path - The path to the .env file.
 * @param options - The options for reading the .env file.
 * @param warnings - The warnings to add to.
 * @returns The environment variables as an object.
 * @throws If the .env file does not exist, or is not valid.
 */
export const readEnvFile = (path: string, options: ReadEnvFileOptions = { onDuplicate: "error" }, warnings?: string[]): EnvSource => {
    if (!fs.existsSync(path)) {
        throw new DnlError(`Env file not found: ${path}`, ExitCodes.usageError);
    }

    const content = fs.readFileSync(path);
    const onDuplicate = options?.onDuplicate ?? "error";

    const warnDoublons = checkForDuplicates(content, onDuplicate);
    if (warnDoublons && warnings) {
        warnings.push(...warnDoublons);
    }

    const parsed = dotenv.parse(content);

    dotenvExpand.expand({
        processEnv: {}, // important, else, process.env is mutated
        parsed,
    });

    return parsed;
};

const checkForDuplicates = (content: Buffer, onDuplicate: "warn" | "error"): string[] | undefined => {
    const ENV_REGEX = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/gm;

    const keys = content.toString().matchAll(ENV_REGEX);
    if (keys === null) {
        return undefined;
    }

    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const key of keys) {
        if (seen.has(key[1])) {
            duplicates.add(key[1]);
        }
        seen.add(key[1]);
    }
    if (duplicates.size <= 0) return undefined;

    if (onDuplicate === "error") {
        throw new DnlError(
            `Duplicate environment variables detected in .env: ${Array.from(duplicates).join(", ")} (dotenv keeps the last value)`,
            ExitCodes.validationError
        );
    }
    return Array.from(duplicates).map((key) => `⚠️ Duplicate env key detected in .env: ${key} (dotenv keeps the last value)`);
};
