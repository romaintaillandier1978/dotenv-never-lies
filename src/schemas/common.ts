import { z } from "zod";
/**
 * Options for the listSchema function. (exemple : "a;b;c")
 * @template T - The type of the elements in the list.
 */
export type SplitterSchemaOptions<T = string> = {
    /**
     * The separator used to split the string into a list.
     */
    splitter?: string;
    /**
     * The schema used to validate the elements in the list.
     */
    of?: z.ZodSchema<T>;
};
/**
 * Options for key=value listSchema function. (exemple : "a=b&c=d")
 * @template T - The type of the elements in the list.
 */
export type DoubleSplitterSchemaOptions<T = string> = {
    /**
     * first level separator used to split the string into a list.
     */
    splitter?: string;
    /**
     * The schema used to validate the elements in the list.
     */
    of?: {
        /**
         * second level separator used to split key-pair.
         */
        splitter?: string;
        /**
         * The schema used to validate the elements in the list.
         */
        of?: z.ZodSchema<T>;
    };
};
