import { getRawValue } from "../export/shared.js";
import { DnlExporter } from "../export/export.types.js";
import { ExportOptions } from "../export/export.types.js";
import { EnvDefinition, EnvDefinitionHelper, EnvSource, InferEnv } from "../core.js";

/**
 * Options for the sample exporter.
 *
 * Exporter-specific options should extend `ExportOptions`.
 * This automatically enables the common CLI options provided
 * by DNL (source selection, secret handling, comments, etc.).
 */
type SampleExportOptions = ExportOptions & { dummyOption?: string };

/**
 * Sample exporter plugin.
 *
 * This file is intentionally simple and serves as a reference
 * implementation for writing custom `dnl export` plugins.
 */
const dummyExporter: DnlExporter = {
    /**
     * Name of the exporter.
     * This is the command used in the CLI:
     *
     *   dnl export sample-exporter
     */
    name: "sample-exporter",
    /**
     * Short description displayed in `dnl export --help`.
     */
    description: "Sample exporter",
    /**
     * Register CLI options specific to this exporter.
     *
     * This method is optional. It can be used to declare
     * exporter-specific options or extend the help text.
     */
    register(cmd) {
        // add your command options here.
        cmd = cmd.option("--dummy-option <value>", "Dummy option");
        // add your help text here.
        cmd = cmd.addHelpText("after", `\nSample exporter example.\n\nExamples:\n    dnl export sample-exporter --dummy-option=value\n`);
        return cmd;
    },
    run(envDef, values, source, options: SampleExportOptions, warnings: string[]) {
        return exportDummy(envDef, values, source, options, warnings);
    },
};

/**
 * Core function of the exporter.
 *
 * At this stage:
 * - the schema has already been loaded
 * - the exporter options have been parsed
 *
 * The exporter simply reads validated variables and converts
 * them to the desired output format.
 */
const exportDummy = (
    envDef: EnvDefinitionHelper<EnvDefinition>,
    values: InferEnv<EnvDefinition>,
    source: EnvSource,
    options: SampleExportOptions,
    warnings: string[]
): string => {
    const result: string[] = [];
    if (options.dummyOption) {
        result.push(`dummyOption=${options.dummyOption}`);
    }
    // If needed, exporters can emit warnings to inform the user
    // about non-fatal issues related to the export process.
    warnings.push("Example warning");

    // Iterate over all validated environment variables and
    // transform them into the desired output format.
    for (const key of Object.keys(values)) {
        // exclude secret if you need to
        if (options.excludeSecret && envDef.def[key].secret) continue;
        // add comment if you need to
        if (options.includeComments && envDef.def[key].description) result.push(`# ${envDef.def[key].description}`);
        // Retrieve the raw value from the selected source.
        // The helper also applies secret masking when required.
        const rawValue = getRawValue(key, source, envDef, options);
        // serialise the result !
        result.push(`${key}=${rawValue}`);
    }
    return result.join("\n");
};

/**
 * CRITICAL: exporters must be exported as default.
 * The plugin registry automatically loads the default export from each declared plugin module.
 */
export default dummyExporter;
