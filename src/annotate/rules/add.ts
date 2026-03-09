import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, DNL_ANNOTATION } from "../report.type.js";
import { getLinkToVar } from "../../ast-tools/ast-helpers.js";
import { hasDnlAnnotation } from "../helper.js";
import { getDefaultEnvValue } from "../../cli/utils/printer.js";

export const addAnnotationRule: AnnotateRule = {
    match(usages) {
        // If at least one has no annotation, we need to add the annotation
        return usages.some((u) => !hasDnlAnnotation(u.anchor, undefined));
    },

    async apply(usages, ctx): Promise<AnnotateEnvRuleIssue[]> {
        const issues: AnnotateEnvRuleIssue[] = [];
        const anchor = usages[0].anchor;
        const old = anchor.getText();
        const indentMatch = old.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : "";
        const body = old.trimStart();

        // Build an object to know the comment characteristics
        for (const u of usages) {
            const issue: AnnotateEnvRuleIssue = {
                nodeText: u.node.getText(),
                annotation: null,
                messages: [],
                pos: u.pos,
            };

            switch (u.kind) {
                case "destructured":
                case "static":
                    if (u.varName in ctx.envDef.def) {
                        issue.annotation = DNL_ANNOTATION.recommendation;
                        const link = getLinkToVar(ctx.project, ctx.schemaPath, u.varName);
                        const defaultValue = getDefaultEnvValue(ctx.envDef.def[u.varName].schema.def);
                        issue.messages.push(`// @see ${u.varName} in your DNL schema : ${link}`);
                        if (defaultValue) {
                            issue.messages.push(`// default value: ${defaultValue}`);
                        }
                    } else {
                        issue.annotation = DNL_ANNOTATION.ignore;
                        issue.messages.push(`// process.env.${u.varName} not in your DNL schema`);
                    }
                    break;
                case "dynamic":
                    issue.annotation = DNL_ANNOTATION.dynamic;
                    issue.messages.push(`// Dynamic access to process.env prevents variable-level analysis`);
                    break;
                case "global":
                    issue.annotation = DNL_ANNOTATION.global;
                    issue.messages.push(`// Global access to process.env prevents variable-level analysis`);
                    break;
            }
            issues.push(issue);
        }

        // Concat all issues to one unique comment (for one statement).
        const lines: string[] = [];
        lines.push(`// ${issues.map((issue) => issue.annotation).join(" ")}`);

        // Deduplicate messages
        const messages = [...new Set(issues.flatMap((issue) => issue.messages))];
        for (const message of messages) {
            lines.push(message);
        }

        // Apply indentation to each comment line
        const comment = lines.map((line) => `${indent}${line}`).join("\n");

        // Reinsert the original statement with its indentation
        anchor.replaceWithText(`${comment}\n${indent}${body}`);

        return issues;
    },
};
