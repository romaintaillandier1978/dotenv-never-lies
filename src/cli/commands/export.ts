import dnl, { EnvSource, InferEnv } from "../../index.js";
import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import path from "path";
import { UsageError } from "../../errors.js";
import { ProgramCliOptions } from "./program.js";
// import { JsonObject } from "type-fest";

export const exportFormatsNames = [
    "docker-env",
    "docker-args",
    "env",
    "k8s-configmap",
    "k8s-secret",
    "github-env",
    "github-secret",
    "gitlab-env",
    "json",
    "ts",
    "js",
] as const;
export type ExportFormat = (typeof exportFormatsNames)[number];
export type ExportResult = {
    content: string;
    warnings: string[];
    out?: string;
};
export type ExportCliOptions = ProgramCliOptions & {
    format: ExportFormat;
    source?: string | undefined;
    warnOnDuplicates?: boolean;
    hideSecret?: boolean;
    excludeSecret?: boolean;
    includeComments?: boolean;
    serializeTyped?: boolean;
    out?: string | undefined;
    force?: boolean;
    k8sName?: string | undefined;
    githubOrg?: string | undefined;
};

const shellEscape = (value: string): string => {
    if (value.length === 0) {
        return "''";
    }
    return `'${value.replace(/'/g, "'\\''")}'`;
};

export const exportCommand = async (options: ExportCliOptions): Promise<ExportResult> => {
    if (options.githubOrg && options.format !== "github-secret") {
        throw new UsageError("--github-org can only be used with the github-secret format");
    }

    if (options.k8sName && !options.format.startsWith("k8s-")) {
        throw new UsageError("--k8s-name can only be used with a k8s-* format");
    }

    if (options.serializeTyped && !["js", "ts", "json"].includes(options.format)) {
        throw new UsageError("--serialize-typed is only valid for js, ts and json exports");
    }


    const schemaPath = resolveSchemaPath(options?.schema);
    const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<any>;
    const warnings: string[] = [];

    const content = contentByFormat(options.format, envDef, options, warnings);

    return {
        content,
        warnings,
        out: options.out,
    };
};

export const contentByFormat = (format: ExportFormat, envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    switch (format) {
        case "k8s-configmap":
            return exportK8sConfigmap(envDef, options, warnings);
        case "k8s-secret":
            return exportK8sSecret(envDef, options, warnings);
        case "ts":
            return exportTs(envDef, options, warnings);
        case "js":
            return exportJs(envDef, options, warnings);
        case "github-env":
            return exportGithubEnv(envDef, options, warnings);
        case "github-secret":
            return exportGithubSecret(envDef, options, warnings);
        case "gitlab-env":
            return exportGitlabEnv(envDef, options, warnings);
        case "json":
            return exportJson(envDef, options, warnings);
        case "env":
            return exportEnv(envDef, options, warnings);
        case "docker-args":
            return exportDockerArgs(envDef, options, warnings);
        case "docker-env":
            return exportDockerEnv(envDef, options, warnings);
        default:
            throw new UsageError(`Unsupported format: ${format}`);
    }
};

// #region serialisation env-like

const getRawValue = (key: string, source: EnvSource, envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions): string => {
    if (options?.hideSecret && envDef.def[key].secret) {
        return "********";
    }
    const raw = source[key]; // raw value from source (i.e. .env or process.env)
    return raw == null ? "" : String(raw);
};

// this clones the .env
export const exportEnv = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    const source = options?.source
        ? dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings)
        : process.env;
    const values = envDef.assert({ source });
    const args = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        if (options?.includeComments && envDef.def[key].description) {
            args.push(`# ${envDef.def[key].description}`);
        }
        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`${key}=${rawValue}`);
    }
    return args.join("\n");
};

export const exportDockerArgs = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    if (options?.includeComments) {
        warnings.push("The --include-comments option is invalid with the docker-args format");
    }
    const source = options?.source
        ? dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings)
        : process.env;
    const values = envDef.assert({ source });
    const args: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`-e ${shellEscape(`${key}=${rawValue}`)}`);
    }
    return args.join(" ");
};

export const exportDockerEnv = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    const source = options?.source
        ? dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings)
        : process.env;
    const values = envDef.assert({ source });
    const args = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        if (options?.includeComments && envDef.def[key].description) {
            args.push(`# ${envDef.def[key].description}`);
        }

        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`${key}=${rawValue}`);
    }
    return args.join("\n");
};

export const exportK8sConfigmap = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    const source = options?.source
        ? dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings)
        : process.env;
    const values = envDef.assert({ source });

    const args: string[] = [];
    args.push(`apiVersion: v1`);
    args.push(`kind: ConfigMap`);
    args.push(`metadata:`);
    const name = options?.k8sName ?? "env-config";
    args.push(`  name: ${name}`);
    args.push(`data:`);

    for (const key of Object.keys(values)) {
        if (envDef.def[key].secret) {
            if (options?.excludeSecret) continue;
            if (!options?.hideSecret) {
                warnings.push(`Secret ${key} exported in a ConfigMap. Use the k8s-secret format.`);
            }
        }

        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`  ${key}: ${JSON.stringify(rawValue)}`);
    }

    return args.join("\n");
};

export const exportK8sSecret = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    const source = options?.source
        ? dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings)
        : process.env;
    const values = envDef.assert({ source });

    const args: string[] = [];
    args.push(`apiVersion: v1`);
    args.push(`kind: Secret`);
    args.push(`type: Opaque`);
    args.push(`metadata:`);
    const name = options?.k8sName ?? "env-secret";
    args.push(`  name: ${name}`);
    args.push(`stringData:`);

    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) continue;
        if (!envDef.def[key].secret) continue; // Secret = only variables marked as secret

        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`  ${key}: ${JSON.stringify(rawValue)}`);
    }

    return args.join("\n");
};

export const exportGithubEnv = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    const source = options?.source
        ? dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings)
        : process.env;
    const values = envDef.assert({ source });

    const args: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) continue;

        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`printf '%s\\n' ${shellEscape(`${key}=${rawValue}`)} >> "$GITHUB_ENV"`);
    }

    return args.join("\n");
};

export const exportGithubSecret = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    if (options?.hideSecret) {
        warnings.push("The --hide-secret option is incompatible with github-secret");
    }
    if (options?.githubOrg && options.githubOrg.includes(" ")) {
        warnings.push("github-org contains a space; gh command likely invalid");
    }
    const source = options?.source
        ? dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings)
        : process.env;
    const values = envDef.assert({ source });

    const scopeFlag = options?.githubOrg ? `--org ${shellEscape(options.githubOrg)}` : "";

    const args: string[] = [];
    for (const key of Object.keys(values)) {
        if (!envDef.def[key].secret) continue;
        if (options?.excludeSecret) continue;
        const rawValue = getRawValue(key, source, envDef, options);
        args.push(`printf '%s' ${shellEscape(rawValue)} | gh secret set ${key} ${scopeFlag} --body-file -`.trim());
    }

    return args.join("\n");
};

export const exportGitlabEnv = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    return exportEnv(envDef, options, warnings);
};

// #endregion serialisation env-like

// #region serialisation json/ts/js

// WARNING : For design reasons and separation of concerns, do not attempt to merge getRawValue and getTypedOrRawValue into a single function.
const getTypedOrRawValue = (
    key: string,
    source: EnvSource,
    values: InferEnv<any>,
    envDef: dnl.EnvDefinitionHelper<any>,
    options: ExportCliOptions
): unknown => {
    if (options?.hideSecret && envDef.def[key].secret) {
        return "********";
    }

    if (options?.serializeTyped) {
        return values[key]; // runtime validated value
    }

    const raw = source[key]; // raw value from source (i.e. .env or process.env)
    return raw == null ? "" : String(raw);
};

export const exportJson = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    if (options?.includeComments) {
        warnings.push("The --include-comments option is ignored for the json format");
    }
    const source = options?.source
        ? dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings)
        : process.env;
    const values = envDef.assert({ source });

    //const args: JsonObject = {};
    const args: Record<string, unknown> = {};
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        args[key] = getTypedOrRawValue(key, source, values, envDef, options);
    }
    return JSON.stringify(args, null, 2);
};

export const exportTs = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    const source = options?.source
        ? dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings)
        : process.env;
    const values = envDef.assert({ source });

    const middle: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        if (options?.includeComments && envDef.def[key].description) {
            middle.push(`    // ${envDef.def[key].description}`);
        }

        middle.push(`    ${key}: ${JSON.stringify(getTypedOrRawValue(key, source, values, envDef, options), null, 2)},`);
    }

    return `export const env = {\n${middle.join("\n")}\n} as const;`;
};

export const exportJs = (envDef: dnl.EnvDefinitionHelper<any>, options: ExportCliOptions, warnings: string[]): string => {
    const source = options?.source
        ? dnl.readEnvFile(path.resolve(process.cwd(), options.source), { onDuplicate: options?.warnOnDuplicates ? "warn" : "error" }, warnings)
        : process.env;
    const values = envDef.assert({ source });

    const middle: string[] = [];
    for (const key of Object.keys(values)) {
        if (options?.excludeSecret && envDef.def[key].secret) {
            continue;
        }
        if (options?.includeComments && envDef.def[key].description) {
            middle.push(`    // ${envDef.def[key].description}`);
        }

        middle.push(`    ${key}: ${JSON.stringify(getTypedOrRawValue(key, source, values, envDef, options), null, 2)},`);
    }

    return `export const env = {\n${middle.join("\n")}\n};`;
};



// #endregion serialisation json/ts/js
