/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { EnvVarDefinition } from "../../core.js";

export type Explanation = {
    key: string;
    description: string;
    type: string;
    required?: boolean;
    default?: string;
    secret: boolean;
    examples?: string[];
};
export const toExplanation = (key: string, value: EnvVarDefinition<any>): Explanation => {
    const def = value.schema.def;
    return {
        key,
        description: value.description,
        type: printZodType(def),
        required: isRequired(def),
        default: getDefaultEnvValue(def),
        secret: value.secret === true,
        examples: value.examples,
    };
};

export function printZodType(def: z.core.$ZodTypeDef): string {
    switch (def.type) {
        case "string":
        case "number":
        case "boolean":
        case "transform":
            return def.type;

        case "enum":
            if ("entries" in def) {
                return Object.keys(def.entries as Record<string, string>)
                    .map((k) => `"${k}"`)
                    .join(" | ");
            }
            return "unknown";

        case "literal":
            if ("values" in def) {
                return (def as any).values[0].toString() + " (literal)";
            }
            return "unknown";
        case "array":
            if ("element" in def) {
                return printZodType(def.element as z.core.$ZodTypeDef) + "[]";
            }
            return "[]";
        case "optional":
            if ("innerType" in def) {
                return printZodType(def.innerType as z.core.$ZodTypeDef) + " | undefined";
            }
            return "unknown  | undefined";
        case "nullable":
            if ("innerType" in def) {
                return printZodType(def.innerType as z.core.$ZodTypeDef) + " | null";
            }
            return "unknown  | null";
        case "default":
            //TODO :  ignore les valeurs par défaut falsy (0, false, "") dans printZodType, donc dnl explain omet des defaults valides.
            if ("innerType" in def) {
                const result = printZodType(def.innerType as z.core.$ZodTypeDef);
                const defaultValue = typeof (def as any).defaultValue === "function" ? (def as any).defaultValue() : ((def as any).defaultValue ?? undefined);

                // const defaultValue = (def as any).defaultValue;
                if (defaultValue !== undefined) {
                    return result + " (default: " + defaultValue.toString() + ")";
                }
                return result;
            }
            return "unknown  | null";

        // z.union
        case "union":
            if ("options" in def) {
                return (def as any).options.map(printZodType).join(" | ");
            }
            return "unknown";

        // z.transform
        case "pipe": {
            if (!("in" in def)) {
                return "unknown (pipe)";
            }
            const result = printZodType(def.in as z.core.$ZodTypeDef);
            return result + " (transform)";
        }

        default:
            return "unknown";
    }
}

export function printZodTypeDts(def: z.core.$ZodTypeDef): string {
    switch (def.type) {
        case "string":
        case "number":
        case "boolean":
        case "transform":
            return def.type;

        case "enum":
            if ("entries" in def) {
                return Object.keys(def.entries as Record<string, string>)
                    .map((k) => `"${k}"`)
                    .join(" | ");
            }
            return "unknown";

        case "literal":
            if ("values" in def) {
                return JSON.stringify((def as any).values[0]);
            }
            return "unknown";
        case "array":
            if ("element" in def) {
                return printZodTypeDts(def.element as z.core.$ZodTypeDef) + "[]";
            }
            return "[]";
        case "optional":
            if ("innerType" in def) {
                return printZodTypeDts(def.innerType as z.core.$ZodTypeDef) + " | undefined";
            }
            return "unknown  | undefined";
        case "nullable":
            if ("innerType" in def) {
                return printZodTypeDts(def.innerType as z.core.$ZodTypeDef) + " | null";
            }
            return "unknown  | null";
        case "default":
            //TODO :  ignore les valeurs par défaut falsy (0, false, "") dans printZodType, donc dnl explain omet des defaults valides.
            if ("innerType" in def) {
                const result = printZodTypeDts(def.innerType as z.core.$ZodTypeDef);
                const defaultValue = typeof (def as any).defaultValue === "function" ? (def as any).defaultValue() : ((def as any).defaultValue ?? undefined);

                // const defaultValue = (def as any).defaultValue;
                if (defaultValue !== undefined) {
                    return result;
                }
                return result;
            }
            return "unknown  | null";

        // z.union
        case "union":
            if ("options" in def) {
                return (def as any).options.map(printZodTypeDts).join(" | ");
            }
            return "unknown";

        // z.transform
        case "pipe": {
            if ("in" in def) {
                return printZodTypeDts(def.in as z.core.$ZodTypeDef);
            }
            return "string"; // fallback défensif
        }

        // case "transform": {
        //     if ((def as any).schema?.def) {
        //         return printZodTypeDts((def as any).schema.def);
        //     }
        //     if ((def as any).in) {
        //         return printZodTypeDts((def as any).in);
        //     }
        //     return "string";
        // }
        default:
            return "unknown";
    }
}

function stringifyEnvValue(value: unknown): string | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    // arrays / objects → JSON
    try {
        return JSON.stringify(value);
    } catch {
        return undefined;
    }
}

export function getDefaultEnvValue(def: z.core.$ZodTypeDef): string | undefined {
    switch (def.type) {
        case "default": {
            const raw = typeof (def as any).defaultValue === "function" ? (def as any).defaultValue() : ((def as any).defaultValue ?? undefined);

            return stringifyEnvValue(raw);
        }

        // transparent wrappers
        case "optional":
        case "nullable":
            if ("innerType" in def) {
                return getDefaultEnvValue(def.innerType as z.core.$ZodTypeDef);
            }
            return undefined;
        case "pipe":
            if ("in" in def) {
                return getDefaultEnvValue(def.in as z.core.$ZodTypeDef);
            }
            return undefined;

        default:
            return undefined;
    }
}

export function isRequired(def: z.core.$ZodTypeDef): boolean {
    switch (def.type) {
        case "optional":
            return false;

        case "default":
            return false;

        // nullable DOES NOT remove the required
        case "nullable":
            if ("innerType" in def) {
                return isRequired(def.innerType as z.core.$ZodTypeDef);
            }
            return false;

        // pipe / transform → transparent regarding required
        case "pipe":
            if ("in" in def) {
                return isRequired(def.in as z.core.$ZodTypeDef);
            }
            return true;

        default:
            return true;
    }
}

export function isTransform(def: z.core.$ZodTypeDef): boolean {
    switch (def.type) {
        // Direct transform wrappers: if we see them anywhere in the tree, it's a transform.
        case "pipe":
        case "transform":
            return true;

        // Transparent wrappers: keep walking.
        case "optional":
        case "nullable":
        case "default":
            if ("innerType" in def) {
                return isTransform(def.innerType as z.core.$ZodTypeDef);
            }
            return false;

        // Arrays: check element.
        case "array":
            if ("element" in def) {
                return isTransform(def.element as z.core.$ZodTypeDef);
            }
            return false;

        // Unions: any option being a transform means transform.
        case "union":
            if ("options" in def) {
                return (def as any).options.some((opt: z.core.$ZodTypeDef) => isTransform(opt));
            }
            return false;

        // Other types: no transform.
        default:
            return false;
    }
}
