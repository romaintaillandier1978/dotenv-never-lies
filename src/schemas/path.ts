import { z } from "zod";

// Note: we intentionally keep this permissive.
//
// Simple heuristic: a path contains at least one / or \
// otherwise we cannot tell.
// If it does, it is very likely a path in a .env context.

export const looksLikePath = (value: string) => value.includes("/") || value.includes("\\");

export const looksLikeFilename = (value: string) => !value.includes("/") && !value.includes("\\") && value.includes(".");

export const looksLikeFilePath = (value: string) => (value.includes("/") || value.includes("\\")) && value.split(/[\\/]/).pop()?.includes(".");

//
// The schemas will reflect this.

/**
 * Creates a Zod schema for a path.
 * @param name - The name of the path.
 * @returns A Zod schema for a path.
 */
export const pathSchema = (): z.ZodType<string> => z.string();

/**
 * Creates a Zod schema for a file path.
 * @param name - The name of the file path.
 * @returns A Zod schema for a file path.
 */
export const filePathSchema = (): z.ZodType<string> => z.string();

/**
 * Creates a Zod schema for a filename.
 * @param name - The name of the filename.
 * @returns A Zod schema for a filename.
 */
export const filenameSchema = (name: string) =>
    z
        .string()
        .min(1)
        .refine((v) => !v.includes("/") && !v.includes("\\"), `${name} must be a filename, not a path`);
