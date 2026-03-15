import { EnvDefinitionHelper } from "../core.js";
import { EnvDefinition } from "../core.js";
import { Command } from "commander";
/**
 * Options communes utilisées par les exporteurs (sans les options CLI du programme).
 */
export type ExportOptions = {
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

/**
 * DNL Exporter interface. To build your own exporter, you need to implement this interface.
 */
export interface DnlExporter {
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
     * Add warnings if needed.
     * @param envDef - The environment definition, you will have to validate
     * @param options - The from the command line.
     * @param warnings - The warnings to add to. You can add warnings to the array if needed.
     * @returns The content to be printed to the console or written to a file.
     */
    run(envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportOptions, warnings: string[]): string;
}
