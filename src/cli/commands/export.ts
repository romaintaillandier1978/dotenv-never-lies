import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { UsageError } from "../../errors.js";
import { ProgramCliOptions } from "./program.js";
import { type ExportOptions, type ExportResult } from "../../export/export.types.js";
import "../../export/exporters/index.js";
import { listExporters, loaderExporters } from "../../export/registry.js";

export { type ExportResult };

export type ExportCliOptions = ProgramCliOptions &
    ExportOptions & {
        format: string;
        out?: string | undefined;
        force?: boolean;
        [key: string]: unknown;
    };

export const exportCommand = async (options: ExportCliOptions): Promise<ExportResult> => {
    console.log("exportCommand", JSON.stringify(options, null, 2));
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

    const exporters = await loaderExporters();
    console.log(
        "exporters",
        JSON.stringify(
            Array.from(exporters.values()).map((e) => e.name),
            null,
            2
        )
    );
    const exporter = exporters.get(options.format);
    if (!exporter) {
        throw new UsageError(`Unsupported format: ${options.format}. Available formats: ${listExporters().join(", ")}`);
    }

    return {
        content: exporter.run(envDef, options, warnings),
        warnings,
        out: options.out,
    };
};
