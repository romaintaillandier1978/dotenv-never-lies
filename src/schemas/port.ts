import { z } from "zod";

/**
 * Creates a Zod schema for a port.
 * @param name - The name of the port.
 * @returns A Zod schema for a port.
 */
export const portSchema = (name: string): z.ZodType<number> => {
    return z.coerce.number(`${name} must be a number`).int(`${name} must be an integer`).min(1, `${name} must be >= 1`).max(65535, `${name} must be <= 65535`);
};
