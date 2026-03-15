import path from "path";
import dnl from "../index.js";
import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../index.js";
import type { ExportOptions } from "./export.types.js";
import { Command } from "commander";

/**
 * Get the source of the environment variables.
 * @param options - The options for the exporter.
 * @param warnings - The warnings to add to.
 * @returns The source of the environment variables.
 */
export const getSource = (options: ExportOptions & { source?: string }, warnings: string[]): EnvSource => {
    if (options.source) {
        return dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options.warnOnDuplicates ? "warn" : "error" }, warnings);
    }
    return process.env as EnvSource;
};

/**
 * Escape a string for shell usage.
 * @param value - The string to escape.
 * @returns The escaped string.
 */
export const shellEscape = (value: string): string => {
    if (value.length === 0) {
        return "''";
    }
    return `'${value.replace(/'/g, "'\\''")}'`;
};

/**
 * Get the validated raw value of an environment variable.
 * @param key - The key of the environment variable.
 * @param source - The source of the environment variables.
 * @param envDef - The environment definition.
 * @param options - The options for the exporter.
 * @returns The validated raw value (as shown in source file) of the environment variable. Hiden (replaced with "********";) if options is hideSecret = true
 */
export const getRawValue = (key: string, source: EnvSource, envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions): string => {
    if (options.hideSecret && envDef.def[key].secret) {
        return "********";
    }
    const raw = source[key];
    return raw == null ? "" : String(raw);
};

/**
 * Apply the serialize-typed option to the command. => use it in your exporter register function.
 *
 * @param cmd - The command to apply the option to.
 * @returns The command with the option applied.
 * @example
 * ```ts
 *  register(cmd) {
 *      cmd = applySerializeTypedOption(cmd);
 *      return cmd;
 *  },
 * ```
 */
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
 * Get the typed or raw value of an environment variable. => use it in your exporter run function.
 * i.e. for json/ts/js formats : typed value if serializeTyped, otherwise raw value. see applySerializeTypedOption
 * @param key - The key of the environment variable.
 * @param source - The source of the environment variables.
 * @param values - The validated environment variables.
 * @param envDef - The environment definition.
 * @param options - The options for the exporter.
 * @returns The typed or raw value of the environment variable.
 */
// DO NOT merge with getRawValue (separation of concerns).
export const getTypedOrRawValue = (
    key: string,
    source: EnvSource,
    values: InferEnv<EnvDefinition>,
    envDef: EnvDefinitionHelper<EnvDefinition>,
    options: ExportOptions & { serializeTyped?: boolean }
): unknown => {
    if (options.hideSecret && envDef.def[key].secret) {
        return "********";
    }

    // Mais non typé ici
    if (options.serializeTyped) {
        return values[key];
    }

    const raw = source[key];
    return raw == null ? "" : String(raw);
};
