import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, DNL_ANNOTATION, DNLAnnotationType } from "../report.type.js";
import { Node, PropertyAccessExpression } from "ts-morph";
import { getAnchor, getLinkToVar, hasDnlAnnotation } from "../helper.js";
import { getDefaultEnvValue } from "../../cli/utils/printer.js";

export const addAnnotationRule: AnnotateRule = {
    match(node) {
        if (!Node.isPropertyAccessExpression(node)) return false;
        if (node.getExpression().getText() !== "process.env") return false;

        const anchor = getAnchor(node);
        if (!anchor) return false;

        // déjà annoté ? on se tait
        if (hasDnlAnnotation(anchor, undefined)) {
            console.log("simpleAnnotationRule already annotated, return false");
            return false;
        }

        return true;
    },

    async apply(node, ctx): Promise<AnnotateEnvRuleIssue> {
        // match() already guarantees this is a PropertyAccessExpression on process.env
        const varName = (node as PropertyAccessExpression).getName();
        const statement = getAnchor(node);
        if (!statement) throw new Error("No statement found");

        const old = statement.getText();
        const isKnown = varName in ctx.envDef.def;
        let annotation: DNLAnnotationType;
        let comment: string;
        let message: string;

        if (isKnown) {
            // @dnl-annotation
            annotation = DNL_ANNOTATION.recommendation;
            const link = getLinkToVar(ctx.project, ctx.schemaPath, varName);
            const defaultValue = getDefaultEnvValue(ctx.envDef.def[varName].schema.def);
            comment = `// ${annotation}`;
            if (link) comment += `\n// @see ${varName} in your DNL schema : ${link}`;
            if (defaultValue) comment += `\n// default value: ${defaultValue}`;
            message = `DNL recommend usage of env.${varName}, instead of process.env.${varName}`;
        } else {
            //@dnl-ignore reason : TODO
            annotation = DNL_ANNOTATION.ignore;
            comment = `// ${annotation} reason : TODO`;
            message = `DNL ignore process.env.${varName}`;
        }

        statement.replaceWithText(`${comment}\n${old}`);

        return { annotation, message };
    },
};
