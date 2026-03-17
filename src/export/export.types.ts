import { Command } from "commander";
import { registerExporter } from "./registry.js";
/**
 * Options communes utilisées par les exporteurs (sans les options CLI du programme).
 */
export type ExportOptions = {
    /**
     * The source of the environment variables. (option -s, --source of the CLI)
     */
    source?: string;
    /**
     * During export process, warn on duplicate environment variables instead of failing. (option --warn-on-duplicates)
     */
    warnOnDuplicates?: boolean;
    /**
     * During export process, sensitive variables should be masked (replace with "********"). (option --hide-secret)
     */
    hideSecret?: boolean;
    /**
     * During export process, sensitive variables should be excluded (do not show them at all). (option --exclude-secret)
     */
    excludeSecret?: boolean;
    /**
     * During export process, comments should be added in the export. (option --include-comments)
     */
    includeComments?: boolean;
};

/**
 * The result of the export process.
 */
export type ExportResult = {
    /**
     * The content of the export.
     */
    content: string;
    /**
     * The warnings of the export process.
     */
    warnings: string[];
};

export interface ExporterUtils {
    shellEscape(value: string): string;
}
export interface ExportEnvVariable {
    key: string;
    value: unknown | undefined;
    description?: string;
    secret?: boolean;
}
export interface ExporterContext<T extends ExportOptions> {
    apiVersion: 1;

    variables: ExportEnvVariable[];
    options: T;
    warnings: string[];

    utils: ExporterUtils;
}

// => run(ctx) {
//   const { values, source } = ctx
// }
export function defineExporter<OptionsT extends ExportOptions = ExportOptions, ExporterT extends DnlExporter<OptionsT> = DnlExporter<OptionsT>>(
    exporter: ExporterT
): ExporterT {
    registerExporter(exporter);
    return exporter;
}

/**
 * DNL Exporter interface. To build your own exporter, you need to implement this interface.
 */
export interface DnlExporter<T extends ExportOptions = ExportOptions> {
    /**
     * The name of the exporter, will appears in dnl export --help
     */
    name: string;
    /**
     * The short one-line description of the exporter, will appears in dnl export --help
     */
    description?: string;
    /**
     * Register the exporter command,
     * add all options you might need for your exporter.
     * Add help text if needed.
     * Enrich and return cmd.
     */
    register?(cmd: Command): Command;
    /**
     * Run the exporter.
     * Transform the validated environment variables into the desired format.
     * Return the content to be printed to the console or written to a file.
     * The context object is versioned and extensible so new capabilities can be
     * added without breaking existing exporters.
     * @param ctx - The context object. It contains the variables, the options, the warnings and the utils.
     * @returns The content to be printed to the console or written to a file.
     */
    run(ctx: ExporterContext<T>): string;
}
