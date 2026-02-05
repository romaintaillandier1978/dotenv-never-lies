export const DNL_ANNOTATION = {
    recommendation: "@dnl-recommendation",
    ignore: "@dnl-ignore",
} as const;

export type DNLAnnotationType = (typeof DNL_ANNOTATION)[keyof typeof DNL_ANNOTATION];

export type RemovalRange = { start: number; end: number };

export type AnnotateEnvRuleIssue = {
    message: string;
    annotation: DNLAnnotationType;
    removalRange?: RemovalRange;
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
};
export type AnnotateReport = {
    issues: AnnotateIssue[];
    summary: AnnotateSummary;
};
