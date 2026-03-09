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

export const exportFormatsNames = [
    "docker-env",
    "docker-args",
    "env",
    "k8s-configmap",
    "k8s-secret",
    "github-env",
    "github-secret",
    "gitlab-env",
    "json",
    "ts",
    "js",
] as const;

export type ExportFormat = (typeof exportFormatsNames)[number];

export type ExportResult = {
    content: string;
    warnings: string[];
    out?: string;
};
