import { z } from "zod";

/**
 * Creates a Zod schema for a JSON value.
 * @param name - The name of the JSON value.
 * @returns A Zod schema for a JSON value.
 */
export function jsonSchema(name: string): z.ZodType<unknown>;

/**
 * Creates a Zod schema for a JSON value with a specific schema.
 * @param name - The name of the JSON value.
 * @param of - The schema used to validate the JSON value.
 * @returns A Zod schema for a JSON value.
 */
export function jsonSchema<T>(name: string, of: z.ZodSchema<T>): z.ZodType<T>;

/**
 * Creates a Zod schema for a JSON value with a specific schema.
 * @param name - The name of the JSON value.
 * @param of - The schema used to validate the JSON value.
 * @returns A Zod schema for a JSON value.
 */
export function jsonSchema<T>(name: string, of?: z.ZodSchema<T>): z.ZodType<T | unknown> {
    return z.string().transform((v, ctx) => {
        let parsed: unknown;

        try {
            parsed = JSON.parse(v);
        } catch {
            ctx.addIssue({
                code: "custom",
                message: `${name} is not a valid JSON`,
            });
            return z.NEVER;
        }

        if (!of) {
            return parsed;
        }

        const result = of.safeParse(parsed);
        if (!result.success) {
            ctx.addIssue({
                code: "custom",
                message: `${name} does not match expected JSON schema`,
            });
            return z.NEVER;
        }

        return result.data;
    });
}
