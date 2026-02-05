import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, DNL_ANNOTATION, type RemovalRange } from "../report.type.js";
import { Node, PropertyAccessExpression } from "ts-morph";
import { getAnchor, getDnlAnnotation, hasDnlAnnotation } from "../helper.js";

export const removeAnnotationRule: AnnotateRule = {
    match(node) {
        if (!Node.isPropertyAccessExpression(node)) return false;
        if (node.getExpression().getText() !== "process.env") return false;

        const anchor = getAnchor(node);
        if (!anchor) return false;

        // pas annoté ? on se tait
        if (!hasDnlAnnotation(anchor, undefined)) {
            return false;
        }

        return true;
    },

    async apply(node): Promise<AnnotateEnvRuleIssue> {
        const varName = (node as PropertyAccessExpression).getName();
        const statement = getAnchor(node);
        if (!statement) {
            // TODO : traiter ce cas, il n'y a aps d'annotation ici !
            return { annotation: DNL_ANNOTATION.ignore, message: `No DNL annotation found for process.env.${varName}` };
        }

        const dnlAnnotation = getDnlAnnotation(statement);
        if (!dnlAnnotation) {
            return { annotation: DNL_ANNOTATION.ignore, message: `No DNL annotation found for process.env.${varName}` };
        }
        const { ranges, annotationType } = dnlAnnotation;
        if (!ranges || ranges.length < 1) {
            return { annotation: DNL_ANNOTATION.ignore, message: `No DNL annotation found for process.env.${varName}` };
        }

        // Remplace the whole block of annotations (comments) by _nothing_,
        // to keep only the statement (ex. « const nodeEnv = process.env.NODE_ENV || "development"; »).
        // Do not modify here : the command will apply the removalRange in batch (descending order).
        const first = ranges[0];
        // Include everything up to the beginning of the statement to also delete the empty lines between comments and code.
        const removalRange: RemovalRange = { start: first.getPos(), end: statement.getStart() };

        return {
            annotation: annotationType,
            message: `DNL annotation removed for process.env.${varName}`,
            removalRange,
        };
    },
};
