import { z } from "zod";

const TRUE_VALUES = ["true", "1", "yes", "y"];
const FALSE_VALUES = ["false", "0", "no", "n"];
const LOOKS_LIKE_BOOLEAN_VALUES: string[] = [...TRUE_VALUES, ...FALSE_VALUES] as const;

export const looksLikeValidBoolean = (value: string) => {
    return LOOKS_LIKE_BOOLEAN_VALUES.includes(value.trim().toLowerCase());
};

/**
 * Creates a Zod schema for a boolean value.
 * @param name - The name of the boolean value.
 * @returns A Zod schema for a boolean value.
 */
export const boolSchema = (name: string): z.ZodType<boolean> => {
    return z.string().transform((v, ctx) => {
        const normalized = v.trim().toLowerCase();
        if (TRUE_VALUES.includes(normalized)) return true;
        if (FALSE_VALUES.includes(normalized)) return false;
        ctx.addIssue({ code: "custom", message: `${name} has invalid value: "${v}"` });
        return z.NEVER;
    });
};
