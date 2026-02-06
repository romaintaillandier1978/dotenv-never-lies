import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, DNL_ANNOTATION } from "../report.type.js";
import { Node } from "ts-morph";
import { getAnchor, getDnlAnnotationType, hasDnlAnnotation } from "../helper.js";
import { getProcessEnvVarName } from "../annotate-collector.js";

function isProcessEnvNode(node: Node): boolean {
    if (!Node.isPropertyAccessExpression(node) && !Node.isElementAccessExpression(node)) return false;
    return node.getExpression().getText() === "process.env";
}

export const checkAnnotationRule: AnnotateRule = {
    match(node) {
        if (!isProcessEnvNode(node)) return false;
        const anchor = getAnchor(node);
        if (!anchor) return false;
        if (!hasDnlAnnotation(anchor)) return true;
        if (getDnlAnnotationType(anchor) === DNL_ANNOTATION.ignore) return false;
        return true;
    },

    async apply(nodes): Promise<AnnotateEnvRuleIssue> {
        const statement = getAnchor(nodes[0]);
        if (!statement) {
            const varNames = nodes.map((n) => getProcessEnvVarName(n)).filter((v): v is string => v !== null);
            return {
                annotation: null,
                message: `No DNL annotation found for process.env ${varNames.join(", ")}`,
                checkLevel: "error",
            };
        }

        const varNames = nodes.map((n) => getProcessEnvVarName(n)).filter((v): v is string => v !== null);
        const noAnnotationIssue: AnnotateEnvRuleIssue = {
            annotation: null,
            message: `No DNL annotation found for process.env ${varNames.join(", ")}`,
            checkLevel: "error",
        };

        if (!hasDnlAnnotation(statement)) return noAnnotationIssue;

        const annotation = getDnlAnnotationType(statement);
        switch (annotation) {
            case null:
                return noAnnotationIssue;
            case DNL_ANNOTATION.ignore:
                return {
                    annotation,
                    message: `process.env ${varNames.join(", ")} is ignored`,
                    checkLevel: "info",
                };
            default:
                return {
                    annotation,
                    message: `Usage of process.env (${varNames.join(", ")}) is not recommended, consider using dnl.env instead`,
                    checkLevel: "warning",
                };
        }
    },
};
