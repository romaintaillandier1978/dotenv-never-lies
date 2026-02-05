import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, DNL_ANNOTATION } from "../report.type.js";
import { Node, PropertyAccessExpression } from "ts-morph";
import { getAnchor, getDnlAnnotationType, hasDnlAnnotation } from "../helper.js";

export const checkAnnotationRule: AnnotateRule = {
    match(node) {
        if (!Node.isPropertyAccessExpression(node)) return false;
        if (node.getExpression().getText() !== "process.env") return false;

        const anchor = getAnchor(node);
        if (!anchor) return false;

        // no annotation => we must treat it
        if (!hasDnlAnnotation(anchor)) {
            return true;
        }
        // ok somebody has choose to ignore this env-var, it was a deliberate choice. DNL respects that.
        if (getDnlAnnotationType(anchor) === DNL_ANNOTATION.ignore) {
            return false;
        }
        // autre annotation => on doit traiter
        return true;
    },

    async apply(node): Promise<AnnotateEnvRuleIssue> {
        const varName = (node as PropertyAccessExpression).getName();

        const noAnnotationIssue: AnnotateEnvRuleIssue = {
            annotation: null,
            message: `No DNL annotation found for process.env.${varName}`,
            checkLevel: "error",
        };

        const statement = getAnchor(node);
        if (!statement) {
            // should never happens, allready checked by match method.
            return noAnnotationIssue;
        }

        // no annotation => error
        if (!hasDnlAnnotation(statement)) {
            return noAnnotationIssue;
        }

        const annotation = getDnlAnnotationType(statement);
        switch (annotation) {
            case null:
                // no annotation => error
                return noAnnotationIssue;

            case DNL_ANNOTATION.ignore:
                // This case cannot happen, because match() has already filtered the cases @dnl-ignore.
                // ok somebody has choose to ignore this env-var, it was a deliberate choice. DNL respects that.
                return {
                    annotation,
                    message: `process.env.${varName} is ignored`,
                    checkLevel: "info",
                };
            default:
                // any other annotation => warning
                return {
                    annotation,
                    message: `Usage of process.env.${varName} is not recommended, consider using dnl.env.${varName} instead`,
                    checkLevel: "warning",
                };
        }
    },
};
