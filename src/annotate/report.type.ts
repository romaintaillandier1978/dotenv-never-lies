export const DNL_ANNOTATION = {
    recommendation: "@dnl-recommendation",
    ignore: "@dnl-ignore",
    dynamic: "@dnl-dynamic-access",
    global: "@dnl-global-access",
    unknown: "@dnl-unknown",
} as const;

export type DNLAnnotationType = (typeof DNL_ANNOTATION)[keyof typeof DNL_ANNOTATION];

export type RemovalRange = { start: number; end: number };

export type CheckLevel = "error" | "warning" | "info";
export type AnnotateEnvRuleIssue = {
    nodeText: string;
    annotation: DNLAnnotationType | null;
    messages: string[];
    pos?: { line: number; column: number };
    removalRange?: RemovalRange;
    checkLevel?: CheckLevel;
};

export type AnnotateIssue = AnnotateEnvRuleIssue & {
    filePath: string;
};

export type AnnotateSummary = {
    filesScanned: number;
    accessesProcessed: number;
    commentsAdded: number;
    commentsRemoved: number;
    checkErrors: number;
    checkWarnings: number;
};

export type AnnotateMode = "check" | "remove" | "add";
export type AnnotateReport = {
    type: "annotate";
    mode: AnnotateMode;
    issues: AnnotateIssue[];
    summary: AnnotateSummary;
};
