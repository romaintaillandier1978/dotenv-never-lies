import type { Project, SourceFile } from "ts-morph";
import type { AnnotateEnvRuleIssue, AnnotateMode, AnnotateReport, DNLAnnotationType } from "./report.type.js";
import { EnvDefinition, EnvDefinitionHelper } from "../index.js";
import { ProcessEnvUsages } from "../ast-tools/ast.types.js";

export type AnnotateRuleContext = {
    mode: AnnotateMode;
    warnAsError: boolean;
    project: Project;
    sourceFile: SourceFile;
    schemaPath: string;
    envDef: EnvDefinitionHelper<EnvDefinition>;
    report: AnnotateReport;
};

export interface AnnotateRule {
    /**
     * Unique rule annotation (used for debug, logs, tests)
     */
    annotation?: DNLAnnotationType;

    /**
     * Return true if this rule can handle the given AST node
     */
    match(access: ProcessEnvUsages[], ctx: AnnotateRuleContext): boolean;

    /**
     * Apply the rule. Receives all process.env nodes from the same statement.
     * - In check mode: must NOT mutate the AST
     * - In fix mode: MAY mutate the AST
     */
    apply(accesses: ProcessEnvUsages[], ctx: AnnotateRuleContext): Promise<AnnotateEnvRuleIssue[]>;
}
