import { z } from "zod";

export const knownExtensions = [".js", ".ts", ".json", ".yaml", ".yml"];

const PATH_SEGMENT = "(?:\\.{1,2}|[a-zA-Z0-9._-]+)";
const PATH_SEPARATOR = "[/\\\\]";
const PATH_REGEX = new RegExp(`^(${PATH_SEGMENT})(${PATH_SEPARATOR}${PATH_SEGMENT})*$`);

export const looksLikeValidPath = (value: string) => PATH_REGEX.test(value);

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
export const filePathSchema = (name: string): z.ZodType<string> =>
    pathSchema(name).refine((v) => knownExtensions.some((ext) => v.toLowerCase().endsWith(ext)), `${name} must be a file path with a known extension`);

const FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;

/**
 * Creates a Zod schema for a filename.
 * @param name - The name of the filename.
 * @returns A Zod schema for a filename.
 */
export const filenameSchema = (name: string): z.ZodType<string> => z.string().refine((v) => FILENAME_REGEX.test(v), `${name} must be a valid filename`);
