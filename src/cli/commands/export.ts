import dnl from "../../index.js";
import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { UsageError } from "../../errors.js";
import { ProgramCliOptions } from "./program.js";
import {
    type ExportFormat,
    type ExportOptions,
    type ExportResult,
    exportFormatsNames,
} from "../../export/export.types.js";
import {
    exportDockerArgs,
    exportDockerEnv,
    exportEnv,
    exportGithubEnv,
    exportGithubSecret,
    exportGitlabEnv,
    exportJs,
    exportJson,
    exportK8sConfigmap,
    exportK8sSecret,
    exportTs,
} from "../../export/exporters/index.js";

export { exportFormatsNames, type ExportFormat, type ExportResult };

export type ExportCliOptions = ProgramCliOptions &
    ExportOptions & {
        format: ExportFormat;
        out?: string | undefined;
        force?: boolean;
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
    const envDef = await loadDef(schemaPath);
    const warnings: string[] = [];

    const content = contentByFormat(options.format, envDef, options, warnings);

    return {
        content,
        warnings,
        out: options.out,
    };
};

export const contentByFormat = (
    format: ExportFormat,
    envDef: dnl.EnvDefinitionHelper<dnl.EnvDefinition>,
    options: ExportCliOptions,
    warnings: string[]
): string => {
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
