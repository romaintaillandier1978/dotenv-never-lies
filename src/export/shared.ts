import path from "path";
import dnl from "../index.js";
import type { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../index.js";
import type { ExportOptions } from "./export.types.js";

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

/**
 * Pour les formats json/ts/js : valeur typée si serializeTyped, sinon chaîne brute.
 * Ne pas fusionner avec getRawValue (séparation des responsabilités).
 */
export const getTypedOrRawValue = (
    key: string,
    source: EnvSource,
    values: InferEnv<EnvDefinition>,
    envDef: EnvDefinitionHelper<EnvDefinition>,
    options: ExportOptions
): unknown => {
    if (options?.hideSecret && envDef.def[key].secret) {
        return "********";
    }

    if (options?.serializeTyped) {
        return values[key];
    }

    const raw = source[key];
    return raw == null ? "" : String(raw);
};
