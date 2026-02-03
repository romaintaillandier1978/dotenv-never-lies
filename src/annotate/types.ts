import type { Node, Project, SourceFile } from "ts-morph";
import type { AnnotateEnvRuleIssue, AnnotateReport } from "./report.type.js";
import { EnvDefinition, EnvDefinitionHelper } from "../index.js";

export type AnnotateRuleContext = {
    project: Project;
    sourceFile: SourceFile;
    schemaPath: string;
    envDef: EnvDefinitionHelper<EnvDefinition>;
    report: AnnotateReport;
};

export interface AnnotateRule {
    /**
     * Unique rule name (used for debug, logs, tests)
     */
    name: string;

    /**
     * Return true if this rule can handle the given AST node
     */
    match(node: Node, ctx: AnnotateRuleContext): boolean;

    /**
     * Apply the rule.
     * - In check mode: must NOT mutate the AST
     * - In fix mode: MAY mutate the AST
     */
    apply(node: Node, ctx: AnnotateRuleContext): Promise<AnnotateEnvRuleIssue>;
}
