import type { Node, SourceFile } from "ts-morph";
import type { ProcessEnvRuleIssue, ProcessReport } from "./report.type.js";

export type ProcessEnvRuleContext = {
    sourceFile: SourceFile;
    isFixMode: boolean;
    dryRun: boolean;
    report: ProcessReport;
};

export interface ProcessEnvRule {
    /**
     * Unique rule name (used for debug, logs, tests)
     */
    name: string;

    /**
     * Return true if this rule can handle the given AST node
     */
    match(node: Node): boolean;

    /**
     * Apply the rule.
     * - In check mode: must NOT mutate the AST
     * - In fix mode: MAY mutate the AST
     */
    apply(node: Node, ctx: ProcessEnvRuleContext): Promise<ProcessEnvRuleIssue>;
}
