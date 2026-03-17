import { defineExporter } from "../export/export.types.js";
import { exporter } from "../index.js";

/**
 * Options for the sample exporter.
 *
 * Exporter-specific options should extend `ExportOptions`.
 * This automatically enables the common CLI options provided
 * by DNL (source selection, secret handling, comments, etc.).
 */
type SampleExportOptions = exporter.ExportOptions & { dummyOption?: string };

// const sampleExporter: exporter.DnlExporter = exporter.defineExporter({
//     name: "sample-exporter",
//     description: "Sample exporter",
//     register(cmd) {
//         cmd = cmd.option("--dummy-option <value>", "Dummy option");
//         return cmd;
//     },
//     run(ctx) {
//         return exportDummy(ctx);
//     },
// });
/**
 * Sample exporter plugin.
 *
 * This file is intentionally simple and serves as a reference
 * implementation for writing custom `dnl export` plugins.
 */
export default defineExporter({
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
    run(ctx: exporter.ExporterContext<SampleExportOptions>) {
        const { options, variables, warnings } = ctx;
        const result: string[] = [];
        if (options.dummyOption) {
            result.push(`dummyOption=${options.dummyOption}`);
        }
        // If needed, exporters can emit warnings to inform the user
        // about non-fatal issues related to the export process.
        warnings.push("Example warning");

        // Iterate over all validated environment variables and
        // transform them into the desired output format.
        for (const variable of variables) {
            // exclude secret if you need to
            if (variable.secret) continue;
            // add comment if you need to
            if (options.includeComments && variable.description) result.push(`# ${variable.description}`);
            // Retrieve the raw value from the selected source.
            // The helper also applies secret masking when required.
            // serialise the result !
            result.push(`${variable.key}=${variable.value}`);
        }
        return result.join("\n");
    },
});
