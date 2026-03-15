import path from "path";
import dnl from "../index.js";
import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../index.js";
import type { ExportOptions } from "./export.types.js";
import { Command } from "commander";

export const getSource = (options: ExportOptions, warnings: string[]): EnvSource => {
    if (options?.source) {
        return dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings);
    }
    return process.env as EnvSource;
};

export const shellEscape = (value: string): string => {
    if (value.length === 0) {
        return "''";
    }
    return `'${value.replace(/'/g, "'\\''")}'`;
};

export const getRawValue = (key: string, source: EnvSource, envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions): string => {
    if (options?.hideSecret && envDef.def[key].secret) {
        return "********";
    }
    const raw = source[key];
    return raw == null ? "" : String(raw);
};

export const applySerializeTypedOption = (cmd: Command): Command => {
    return cmd.option("--serialize-typed", "Serialize validated runtime values (js/ts/json ...). See below for more details.").addHelpText(
        "after",
        `\nSerialize validated runtime values (js/ts/json ...):
    When the --serialize-typed option is used, runtime values (after Zod transformations and validation)
    are serialized instead of the raw (but still validated) values from the source (.env or process.env).

    Example:

    .env file:
    NODE_CORS_ORIGIN=https://a.site.com;https://b.site.com;https://c.site.com

    env.dnl.ts file:
    NODE_CORS_ORIGIN: {
        description: "Allowed frontend URLs separated by semicolons",
        schema: z.string().transform((v) =>
          v.split(";").map((s) => s.trim()).filter(Boolean)
        ),
    },

    dnl export json --source .env
    {
        "NODE_CORS_ORIGIN": "https://a.site.com;https://b.site.com;https://c.site.com"
    }

    dnl export json --source .env --serialize-typed
    {
        "NODE_CORS_ORIGIN": [
            "https://a.site.com",
            "https://b.site.com",
            "https://c.site.com"
        ]
    }`
    );
};

/**
 * Pour les formats json/ts/js : valeur typée si serializeTyped, sinon chaîne brute.
 * Ne pas fusionner avec getRawValue (séparation des responsabilités).
 */
export const getTypedOrRawValue = (
    key: string,
    source: EnvSource,
    values: InferEnv<EnvDefinition>,
    envDef: EnvDefinitionHelper<EnvDefinition>,
    options: ExportOptions & { serializeTyped?: boolean }
): unknown => {
    if (options?.hideSecret && envDef.def[key].secret) {
        return "********";
    }

    // Mais non typé ici
    if (options?.serializeTyped) {
        return values[key];
    }

    const raw = source[key];
    return raw == null ? "" : String(raw);
};
