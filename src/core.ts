import { z } from "zod";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { EnvFileNotFoundError } from "./errors.js";
import fs from "fs";

/**
 * Un objet contenant les variables d'environnement sous forme de string, issue d'un fichier .env ou de process.env.
 */
export type EnvSource = Record<string, string | undefined>;

/**
 * Une variable d'environnement.
 */
export interface EnvVarDefinition<T extends z.ZodType = z.ZodType> {
    /**
     * Le schéma Zod de la variable d'environnement.
     */
    schema: T;
    /**
     * La description de la variable d'environnement.
     */
    description: string;
    /**
     * Indique si la variable d'environnement est secrète (pour les token, les mots de passe), RFU.
     */
    secret?: boolean;
    /**
     * Indique des exemple pour cette variable
     */
    examples?: string[];
}

// any est nécessaire ici. Pour tirer le meilleur de l'inférence ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * Un objet contenant les variables d'environnement définies.
 */
export type EnvDefinition = Record<string, EnvVarDefinition<any>>;

/**
 * Le shape Zod du schéma d'environnement.
 */
export type ZodShapeFromEnv<T extends EnvDefinition> = {
    [K in keyof T & string]: T[K]["schema"];
};
/**
 * Le type inféré du schéma d'environnement.
 */
export type InferEnv<T extends EnvDefinition> = {
    [K in keyof T & string]: z.infer<T[K]["schema"]>;
};

type CheckFn = (options?: { source?: EnvSource | undefined }) => boolean;
type LoadFn<T extends EnvDefinition> = (options?: { source?: EnvSource | undefined }) => InferEnv<T>;

/**
 * Un objet contenant les fonctions pour vérifier, charger et afficher les variables d'environnement.
 * @template T - Le schéma d'environnement à définir.
 */
export type EnvDefinitionHelper<T extends EnvDefinition> = {
    /**
     * Le schéma d'environnement défini.
     */
    def: T;
    /**
     * Le shape Zod du schéma d'environnement.
     */
    zodShape: ZodShapeFromEnv<T>;
    /**
     * Le schéma Zod du schéma d'environnement.
     */
    zodSchema: z.ZodObject<ZodShapeFromEnv<T>>;
    /**
     * Vérifie si les variables d'environnement sont valides sans lever d'exception.
     *
     * Si `options.source` est fourni, il est utilisé avec le mode strict (zod.strict())
     * Si `options.source` est fourni, on utilise `process.env`, en mode non strict
     *
     * @param options - Les options pour vérifier les variables d'environnement.
     * @returns true si les variables d'environnement sont valides, false sinon.
     */
    check: CheckFn;
    /**
     * Charge les variables d'environnement.
     *
     * Si `options.source` est fourni, il est utilisé avec le mode strict (zod.strict())
     * Si `options.source` est fourni, on utilise `process.env`, en mode non strict
     *
     * @param options - Les options pour charger les variables d'environnement.
     * @returns Les variables d'environnement chargées.
     * @throws Si les variables d'environnement sont invalides.
     */
    load: LoadFn<T>;
};

/**
 * Définit un schéma d'environnement.
 * @param def - Le schéma d'environnement à définir.
 * @returns Un objet contenant les fonctions pour vérifier, charger et afficher les variables d'environnement.
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

    const load: LoadFn<T> = (options) => {
        const { source, strict } = extractParams(options);
        return getSchema(strict).parse(source) as InferEnv<T>;
    };

    return { def, zodShape, zodSchema, check, load };
};

/**
 * Lit un fichier .env et retourne les variables d'environnement sous forme d'objet.
 * Utilise dotenv et dotenv-expand.
 * @example
 * ```typescript
 * const ENV = envDefinition.load({ source: readEnvFile(".env") });
 * ```
 * @param path - Le chemin vers le fichier .env.
 * @returns Les variables d'environnement sous forme d'objet.
 * @throws Si le fichier .env n'existe pas, ou n'est pas conforme
 */
export const readEnvFile = (path: string): EnvSource => {
    if (!fs.existsSync(path)) {
        throw new EnvFileNotFoundError(path);
    }
    const content = fs.readFileSync(path);
    const parsed = dotenv.parse(content);

    dotenvExpand.expand({
        processEnv: {}, // important, else, process.env is mutated
        parsed,
    });

    return parsed;
};
