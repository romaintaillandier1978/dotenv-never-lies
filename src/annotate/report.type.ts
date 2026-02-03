export type AnnotateEnvRuleIssue = {
    message: string;
};

export type AnnotateIssue = AnnotateEnvRuleIssue & {
    filePath: string;
    line: number;
    column: number;
    ruleName: string;
};

export type AnnotateSummary = {
    filesScanned: number;
    nodesProcessed: number;
    commentsAdded: number;
};
export type AnnotateReport = {
    issues: AnnotateIssue[];
    summary: AnnotateSummary;
};
