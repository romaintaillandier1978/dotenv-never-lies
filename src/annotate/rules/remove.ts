import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, DNL_ANNOTATION, type RemovalRange } from "../report.type.js";
import { Node } from "ts-morph";
import { getAnchor, getDnlAnnotation, hasDnlAnnotation } from "../helper.js";
import { getProcessEnvVarName } from "../annotate-collector.js";

function isProcessEnvNode(node: Node): boolean {
    if (!Node.isPropertyAccessExpression(node) && !Node.isElementAccessExpression(node)) return false;
    return node.getExpression().getText() === "process.env";
}

export const removeAnnotationRule: AnnotateRule = {
    match(node) {
        if (!isProcessEnvNode(node)) return false;
        const anchor = getAnchor(node);
        if (!anchor) return false;
        if (!hasDnlAnnotation(anchor, undefined)) return false;
        return true;
    },

    async apply(nodes): Promise<AnnotateEnvRuleIssue> {
        const statement = getAnchor(nodes[0]);
        const varNames = nodes.map((n) => getProcessEnvVarName(n)).filter((v): v is string => v !== null);
        const msg = varNames.length === 1
            ? `No DNL annotation found for process.env.${varNames[0]}`
            : `No DNL annotation found for process.env ${varNames.join(", ")}`;
        if (!statement) {
            return { annotation: DNL_ANNOTATION.ignore, message: msg };
        }

        const dnlAnnotation = getDnlAnnotation(statement);
        if (!dnlAnnotation) {
            return { annotation: DNL_ANNOTATION.ignore, message: msg };
        }
        const { ranges, annotationType } = dnlAnnotation;
        if (!ranges || ranges.length < 1) {
            return { annotation: DNL_ANNOTATION.ignore, message: msg };
        }

        const first = ranges[0];
        const removalRange: RemovalRange = { start: first.getPos(), end: statement.getStart() };

        return {
            annotation: annotationType,
            message: varNames.length === 1
                ? `DNL annotation removed for process.env.${varNames[0]}`
                : `DNL annotation removed for process.env (${varNames.join(", ")})`,
            removalRange,
        };
    },
};
