import { z } from "zod";

export const knownExtensions = [".js", ".ts", ".json", ".yaml", ".yml"];

// TODO : vérifier si ces regex sont correctes sur tous les OS.
const PATH_SEGMENT = "(?:\\.{1,2}|[a-zA-Z0-9._-]+)";
const PATH_SEPARATOR = "[/\\\\]";
const PATH_REGEX = new RegExp(`^(${PATH_SEGMENT})(${PATH_SEPARATOR}${PATH_SEGMENT})*$`);

// Au plus simple : un path contient au moins un / ou un \
// sinon on sait pas.
// si oui, c'est presque certain que c'est un path, dans un .env
export const looksLikePath = (value: string) => value.includes("/") || value.includes("\\");

export const looksLikeFilename = (value: string) => !value.includes("/") && !value.includes("\\") && value.includes(".");

export const looksLikeFilePath = (value: string) => (value.includes("/") || value.includes("\\")) && value.split(/[\\/]/).pop()?.includes(".");

/**
 * Creates a Zod schema for a path.
 * @param name - The name of the path.
 * @returns A Zod schema for a path.
 */
export const pathSchema = (name: string): z.ZodType<string> =>
    z
        .string()
        .min(1)
        .refine((v) => PATH_REGEX.test(v), `${name} must be a valid path (portable, relative or absolute)`);

/**
 * Creates a Zod schema for a file path.
 * @param name - The name of the file path.
 * @returns A Zod schema for a file path.
 */
// TODO : celle là est un peu faible !
export const filePathSchema = (name: string): z.ZodType<string> =>
    pathSchema(name).refine((v) => knownExtensions.some((ext) => v.toLowerCase().endsWith(ext)), `${name} must be a valid file path`);

// cette regex me semble foireuse
const FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;

/**
 * Creates a Zod schema for a filename.
 * @param name - The name of the filename.
 * @returns A Zod schema for a filename.
 */
export const filenameSchema = (name: string): z.ZodType<string> => z.string().refine((v) => FILENAME_REGEX.test(v), `${name} must be a valid filename`);
