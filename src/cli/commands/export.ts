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
    };

export const exportCommand = async (options: ExportCliOptions): Promise<ExportResult> => {
    const schemaPath = resolveSchemaPath(options?.schema);
    const envDef = await loadDef(schemaPath);
    const warnings: string[] = [];

    const exporters = await loaderExporters();
    // console.log(
    //     "exporters",
    //     JSON.stringify(
    //         Array.from(exporters.values()).map((e) => e.name),
    //         null,
    //         2
    //     )
    // );
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
