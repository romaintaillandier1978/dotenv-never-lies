import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, DNL_ANNOTATION } from "../report.type.js";
import { getLinkToVar } from "../../ast-tools/ast-helpers.js";
import { hasDnlAnnotation } from "../helper.js";
import { getDefaultEnvValue } from "../../cli/utils/printer.js";

export const addAnnotationRule: AnnotateRule = {
    match(processEnvAccesses) {
        // If at least one has no annotation, we need to add the annotation
        return processEnvAccesses.some((pea) => !hasDnlAnnotation(pea.anchor, undefined));
    },

    async apply(processEnvAccess, ctx): Promise<AnnotateEnvRuleIssue[]> {
        const issues: AnnotateEnvRuleIssue[] = [];
        const anchor = processEnvAccess[0].anchor;
        const old = anchor.getText();

        // Build an object to know the comment characteristics
        for (const pea of processEnvAccess) {
            const issue: AnnotateEnvRuleIssue = {
                nodeText: pea.node.getText(),
                annotation: null,
                messages: [],
                pos: pea.pos,
            };

            switch (pea.kind) {
                case "static":
                    if (pea.varName in ctx.envDef.def) {
                        issue.annotation = DNL_ANNOTATION.recommendation;
                        const link = getLinkToVar(ctx.project, ctx.schemaPath, pea.varName);
                        const defaultValue = getDefaultEnvValue(ctx.envDef.def[pea.varName].schema.def);
                        issue.messages.push(`// @see ${pea.varName} in your DNL schema : ${link}`);
                        if (defaultValue) {
                            issue.messages.push(`// default value: ${defaultValue}`);
                        }
                    } else {
                        issue.annotation = DNL_ANNOTATION.ignore;
                        issue.messages.push(`// process.env.${pea.varName} not in your DNL schema`);
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
        let comment = `// ${issues.map((issue) => issue.annotation).join(" ")}`;
        // Deduplicate if needed
        const messages = [...new Set(issues.flatMap((issue) => issue.messages))];
        for (const message of messages) {
            comment += `\n${message}`;
        }
        anchor.replaceWithText(`${comment}\n${old}`);

        return issues;
    },
};
