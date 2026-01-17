import { z } from "zod";
import { SplitterSchemaOptions } from "./common.js";

const defaultKeyValueOptions = {
    splitter: "=",
    of: z.string(),
};

/**
 * Creates a Zod schema for a key-value pair.
 * @param name - The name of the key-value pair.
 * @param options - The options for the key-value pair schema.
 * @returns an object with a single key
 */
export const keyValueSchema = <T = string>(name: string, options: SplitterSchemaOptions<T> = {}): z.ZodType<Record<string, T>> => {
    const opts = { ...defaultKeyValueOptions, ...options } as Required<SplitterSchemaOptions<T>>;
    return z.string().transform((v, ctx) => {
        const parts = v.split(opts.splitter);

        if (parts.length !== 2) {
            ctx.addIssue({ code: "custom", message: `${name} contains an invalid entry: "${v}"` });
            return z.NEVER;
        }
        const [keyPart, valuePart] = parts;

        const key = z.string().safeParse(keyPart);
        if (!key.success) {
            ctx.addIssue({ code: "custom", message: `${name} contains an invalid key: "${keyPart}"` });
            return z.NEVER;
        }
        const value = opts.of.safeParse(valuePart);
        if (!value.success) {
            ctx.addIssue({ code: "custom", message: `${name} contains an invalid value: "${valuePart}"` });
            return z.NEVER;
        }
        return { [key.data]: value.data };
    });
};
