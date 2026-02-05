export const DNL_ANNOTATION = {
    recommendation: "@dnl-recommendation",
    ignore: "@dnl-ignore",
    unknown: "@dnl-unknown",
} as const;

export type DNLAnnotationType = (typeof DNL_ANNOTATION)[keyof typeof DNL_ANNOTATION];

export type RemovalRange = { start: number; end: number };

export type CheckLevel = "error" | "warning" | "info";
export type AnnotateEnvRuleIssue = {
    message: string;
    annotation: DNLAnnotationType | null;
    removalRange?: RemovalRange;
    checkLevel?: CheckLevel;
};

export type AnnotateIssue = AnnotateEnvRuleIssue & {
    filePath: string;
    line: number;
    column: number;
};

export type AnnotateSummary = {
    filesScanned: number;
    nodesProcessed: number;
    commentsAdded: number;
    commentsRemoved: number;
    checkErrors: number;
    checkWarnings: number;
};
export type AnnotateMode = "check" | "remove" | "annotate";
export type AnnotateReport = {
    mode: AnnotateMode;
    issues: AnnotateIssue[];
    summary: AnnotateSummary;
};
