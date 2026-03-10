/**
 * Options communes utilisées par les exporteurs (sans les options CLI du programme).
 */
export type ExportOptions = {
    source?: string | undefined;
    warnOnDuplicates?: boolean;
    hideSecret?: boolean;
    excludeSecret?: boolean;
    includeComments?: boolean;
    serializeTyped?: boolean;
    k8sName?: string | undefined;
    githubOrg?: string | undefined;
};

export type ExportResult = {
    content: string;
    warnings: string[];
    out?: string;
};
