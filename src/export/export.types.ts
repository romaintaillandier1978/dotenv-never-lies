/**
 * Options communes utilisées par les exporteurs (sans les options CLI du programme).
 */
export type ExportOptions = {
    source?: string | undefined;
    warnOnDuplicates?: boolean;
    hideSecret?: boolean;
    excludeSecret?: boolean;
    includeComments?: boolean;
};

export type ExportResult = {
    content: string;
    warnings: string[];
    out?: string;
};
