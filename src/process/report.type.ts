export type ProcessIssueLevel = "warning" | "error";
export type ProcessIssueAction =
    | "none" // check, ou non-fixable
    | "comment-added" // fallback
    | "replaced" // vrai fix
    | "skipped"; // @dnl-ignore

export type ProcessEnvRuleIssue = {
    level: ProcessIssueLevel;
    message: string;
    action: ProcessIssueAction;
};

export type ProcessIssue = ProcessEnvRuleIssue & {
    filePath: string;
    line: number;
    column: number;
    ruleName: string;
};

export type ProcessSummary = {
    filesScanned: number;
    nodesProcessed: number;

    errors: number;
    warnings: number;

    fixesApplied: number;
    commentsAdded: number;
};
export type ProcessReport = {
    mode: "check" | "fix" | "fix-dry-run";

    issues: ProcessIssue[];
    summary: ProcessSummary;
};
