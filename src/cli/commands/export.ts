import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { UsageError } from "../../errors.js";
import { ProgramCliOptions } from "./program.js";
import { type ExportOptions, type ExportResult } from "../../export/export.types.js";
import "../../export/exporters/index.js";
import { listExporters, loaderExporters } from "../../export/registry.js";
import { getSource } from "../../export/shared.js";

export { type ExportResult };

export type ExportCliOptions = ProgramCliOptions &
    ExportOptions & {
        warnOnDuplicates?: boolean;
        format: string;
        out?: string | undefined;
        force?: boolean;
    };

export const exportCommand = async (options: ExportCliOptions): Promise<ExportResult> => {
    const schemaPath = resolveSchemaPath(options?.schema);
    const envDef = await loadDef(schemaPath);
    const warnings: string[] = [];

    const exporters = await loaderExporters();

    const exporter = exporters.get(options.format);
    if (!exporter) {
        throw new UsageError(`Unsupported format: ${options.format}. Available formats: ${listExporters().join(", ")}`);
    }

    const source = getSource(options, warnings);
    const validatedValues = envDef.assert({ source });
    return {
        content: exporter.run(envDef, validatedValues, source, options, warnings),
        warnings,
    };
};
