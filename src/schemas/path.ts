import { z } from "zod";

// Note to myself :
// On est volontairement permissifs.
//
// On fait au plus simple : un path contient au moins un / ou un \
// sinon on sait pas.
// si oui, c'est presque certain que c'est un path, dans un .env

export const looksLikePath = (value: string) => value.includes("/") || value.includes("\\");

export const looksLikeFilename = (value: string) => !value.includes("/") && !value.includes("\\") && value.includes(".");

export const looksLikeFilePath = (value: string) => (value.includes("/") || value.includes("\\")) && value.split(/[\\/]/).pop()?.includes(".");

//
// Les schéma vont refléter ca

/**
 * Creates a Zod schema for a path.
 * @param name - The name of the path.
 * @returns A Zod schema for a path.
 */
export const pathSchema = (name: string): z.ZodType<string> => z.string().min(1);

/**
 * Creates a Zod schema for a file path.
 * @param name - The name of the file path.
 * @returns A Zod schema for a file path.
 */
export const filePathSchema = (name: string): z.ZodType<string> => z.string().min(1);

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
