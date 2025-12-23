import { z } from "zod";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { EnvFileNotFoundError } from "./errors.js";
import fs from "fs";

export type EnvSource = Record<string, string | undefined>;

export type LoadMode = "runtime" | "strict";

export interface EnvVarDefinition<T extends z.ZodType = z.ZodType> {
    schema: T;
    description: string;
    secret?: boolean;
}

// any est nécessaire ici. Pour tirer le meilleur de l'inférence ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnvDefinition = Record<string, EnvVarDefinition<any>>;

export type ZodShapeFromEnv<T extends EnvDefinition> = {
    [K in keyof T & string]: T[K]["schema"];
};
export type InferEnv<T extends EnvDefinition> = {
    [K in keyof T & string]: z.infer<T[K]["schema"]>;
};

type AssertFn = (source: unknown, mode: LoadMode) => void;
type CheckFn = (options: { source: EnvSource; mode: LoadMode }) => boolean;
type LoadFn<T extends EnvDefinition> = (options: { source: EnvSource; mode: LoadMode }) => InferEnv<T>;
type HelpFn = () => void;

export type EnvDefinitionHelper<T extends EnvDefinition> = {
    def: T;
    zodShape: ZodShapeFromEnv<T>;
    zodSchema: z.ZodObject<ZodShapeFromEnv<T>>;
    assert: AssertFn;
    check: CheckFn;
    load: LoadFn<T>;
    help: HelpFn;
};

export const define = <T extends EnvDefinition>(def: T): EnvDefinitionHelper<T> => {
    const zodShape = Object.fromEntries(Object.entries(def).map(([key, value]) => [key, value.schema])) as ZodShapeFromEnv<T>;
    const zodSchema: z.ZodObject<ZodShapeFromEnv<T>> = z.object(zodShape);
    const strictSchema = zodSchema.strict();
    const getSchema = (mode: LoadMode) => (mode === "strict" ? strictSchema : zodSchema);

    function assert(source: unknown, mode: LoadMode): asserts source is InferEnv<T> {
        getSchema(mode).parse(source);
    }
    const check: CheckFn = (options): boolean => {
        return getSchema(options.mode).safeParse(options.source).success;
    };
    const load: LoadFn<T> = (options) => {
        return getSchema(options.mode).parse(options.source) as InferEnv<T>;
    };

    const help: HelpFn = () => {
        // any est nécessaire ici. Pour tirer le meilleur de l'inférence ts.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.entries(def).forEach(([key, value]: [string, EnvVarDefinition<any>]) => {
            console.log(`${key}: ${value.description}`);
        });
    };

    return { def, zodShape, zodSchema, check, assert, load, help };
};

export const readEnvFile = (path: string): EnvSource => {
    if (!fs.existsSync(path)) {
        throw new EnvFileNotFoundError(path);
    }
    const result = dotenv.config({ path });
    if (result.error) throw result.error;

    dotenvExpand.expand(result);

    return (result.parsed ?? {}) as EnvSource;
};

type GlobalAssertFn = <T extends EnvDefinition>(envDef: EnvDefinitionHelper<T>, source: unknown, mode: LoadMode) => asserts source is InferEnv<T>;

export const assertEnv: GlobalAssertFn = (envDef, source, mode) => {
    envDef.assert(source, mode);
};
