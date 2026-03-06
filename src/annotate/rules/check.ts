import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, DNL_ANNOTATION } from "../report.type.js";
import { getDnlAnnotationType, hasDnlAnnotation } from "../helper.js";
import { ProcessEnvUsages } from "../../ast-tools/ast.types.js";

export const checkAnnotationRule: AnnotateRule = {
    match(processEnvAccesses) {
        function matchOne(pea: ProcessEnvUsages): boolean {
            if (!hasDnlAnnotation(pea.anchor)) return true;
            if (getDnlAnnotationType(pea.anchor) === DNL_ANNOTATION.ignore) return false;
            return true;
        }

        return processEnvAccesses.some((pea) => matchOne(pea));
    },

    async apply(processEnvAccesses): Promise<AnnotateEnvRuleIssue[]> {
        const issues: AnnotateEnvRuleIssue[] = [];

        for (let i = 0; i < processEnvAccesses.length; i++) {
            const pea = processEnvAccesses[i];
            const noAnnotationIssue: AnnotateEnvRuleIssue = {
                annotation: null,
                messages: [`No DNL annotation found for  ${pea.node.getText()}`],
                checkLevel: "error",
                nodeText: pea.node.getText(),
            };

            const anchor = pea.anchor;
            // No annotation => Error!
            if (!anchor || !hasDnlAnnotation(anchor)) {
                issues.push(noAnnotationIssue);
                continue;
            }

            // If we have an annotation, retrieve it and create the corresponding issue.
            const annotation = getDnlAnnotationType(anchor);
            const issue: AnnotateEnvRuleIssue = {
                nodeText: pea.node.getText(),
                annotation,
                messages: [],
                pos: pea.pos,
            };
            switch (annotation) {
                case null:
                    issues.push(noAnnotationIssue);
                    break;
                case DNL_ANNOTATION.ignore:
                    // Normally this case is filtered out by match before reaching apply.
                    // We keep the case to produce an empty/absurd result, but it should not happen.
                    issue.checkLevel = "info";
                    issues.push(issue);
                    break;
                default:
                    issue.checkLevel = "warning";
                    issues.push(issue);
                    break;
            }
        }
        return issues;
    },
};
