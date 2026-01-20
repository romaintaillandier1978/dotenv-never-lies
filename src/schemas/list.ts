import { z } from "zod";
import { keyValueSchema } from "./key-value.js";
import { SplitterSchemaOptions, DoubleSplitterSchemaOptions } from "./common.js";
import { Except } from "type-fest";

const defaultListOptions = {
    splitter: ";",
    of: z.string(),
};

const defaultKeyValueListOptions = {
    splitter: "&",
    of: {
        splitter: "=",
        of: z.string(),
    },
};
/**
 * Creates a Zod schema for a list of elements.
 * @param name - The name of the list.
 * @param options - The options for the list schema.
 * @param options.splitter - The separator used to split the string into a list. (default: ";")
 * @param options.of - The schema used to validate the elements in the list. (default: z.string())
 * @returns A Zod schema for a list of elements.
 */
export const listSchema = <T = string>(name: string, options: SplitterSchemaOptions<T> = {}): z.ZodType<T[]> => {
    const opts = { ...defaultListOptions, ...options } as Required<SplitterSchemaOptions<T>>;

    return z.string().transform((v, ctx) => {
        const values = v
            .split(opts.splitter)
            .map((s) => s.trim())
            .filter(Boolean);

        return values.map((entry) => {
            const res = opts.of.safeParse(entry);
            if (!res.success) {
                ctx.addIssue({ code: "custom", message: `${name} contains an invalid entry: "${entry}"` });
                return z.NEVER;
            }
            return res.data;
        });
    });
};

/**
 * Creates a Zod schema for a list of URLs.
 * @param name - The name of the list.
 * @param options - The options for the list schema.
 * @returns A Zod schema for a list of URLs.
 */
export const urlListSchema = (name: string, options?: Except<SplitterSchemaOptions<string>, "of">) =>
    listSchema(name, {
        ...options,
        of: z.url(),
    });

/**
 * Creates a Zod schema for a list of emails.
 * @param name - The name of the list.
 * @param options - The options for the list schema.
 * @returns A Zod schema for a list of emails.
 */
export const emailListSchema = (name: string, options?: Except<SplitterSchemaOptions<string>, "of">) =>
    listSchema(name, {
        ...options,
        of: z.email(),
    });

/**
 * Creates a Zod schema for a list of key-value pairs using two separators.
 * @Example firstname=Romain&lastname=Taillandier
 * => will be parsed as an array of objects with a single key: [{ firstname: "Romain" }, { lastname: "Taillandier" }]
 * @param name - The name of the list.
 * @param options - The options for the list schema.
 * @param options.splitter - The separator used to split the string into a list of key-value pairs. (default: "&")
 * @param options.of - The schema used to validate the key-value pairs. (default: "=")
 * @returns an array of objects with a single key
 */
export const keyValueListSchema = <T = string>(name: string, options: DoubleSplitterSchemaOptions<T> = {}): z.ZodType<Record<string, T>[]> => {
    const outerSplitter = options.splitter ?? defaultKeyValueListOptions.splitter;
    const innerOptions: Required<SplitterSchemaOptions<T>> = {
        splitter: options.of?.splitter ?? defaultKeyValueListOptions.of.splitter,
        of: (options.of?.of ?? z.string()) as z.ZodSchema<T>,
    };
    return listSchema(name, {
        splitter: outerSplitter,
        of: keyValueSchema(name, innerOptions),
    });
};

/**
 * Creates a Zod schema for a map of key-value pairs using two separators. Duplicate keys are rejected.
 * @Example firstname=Romain&lastname=Taillandier
 * => will be parsed as { firstname: "Romain", lastname: "Taillandier" }
 * @param name - The name of the map.
 * @param options - The options for the map schema.
 * @returns a map of key-value pairs
 */
export const keyValueMapSchema = <T = string>(name: string, options: DoubleSplitterSchemaOptions<T> = {}): z.ZodType<Record<string, T>> => {
    return keyValueListSchema<T>(name, options).transform((list, ctx) => {
        const result: Record<string, T> = {};

        for (const entry of list) {
            const [key, value] = Object.entries(entry)[0];
            if (key in result) {
                ctx.addIssue({
                    code: "custom",
                    message: `${name} contains duplicate key: "${key}"`,
                });
                return z.NEVER;
            }
            result[key] = value;
        }

        return result;
    });
};
