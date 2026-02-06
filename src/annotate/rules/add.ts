import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, DNL_ANNOTATION, DNLAnnotationType } from "../report.type.js";
import { Node } from "ts-morph";
import { getAnchor, getLinkToVar, hasDnlAnnotation } from "../helper.js";
import { getDefaultEnvValue } from "../../cli/utils/printer.js";
import { getProcessEnvVarName } from "../annotate-collector.js";

function isProcessEnvNode(node: Node): boolean {
    if (!Node.isPropertyAccessExpression(node) && !Node.isElementAccessExpression(node)) return false;
    return node.getExpression().getText() === "process.env";
}

export const addAnnotationRule: AnnotateRule = {
    match(node) {
        if (!isProcessEnvNode(node)) return false;
        const anchor = getAnchor(node);
        if (!anchor) return false;
        if (hasDnlAnnotation(anchor, undefined)) {
            return false;
        }
        return true;
    },

    async apply(nodes, ctx): Promise<AnnotateEnvRuleIssue> {
        const statement = getAnchor(nodes[0]);
        if (!statement) throw new Error("No statement found");
        const old = statement.getText();

        const refs: { varName: string; known: boolean; link: string | null; defaultValue?: string }[] = [];
        for (const node of nodes) {
            const varName = getProcessEnvVarName(node);
            if (varName === null) continue;
            const isKnown = varName in ctx.envDef.def;
            const link = getLinkToVar(ctx.project, ctx.schemaPath, varName);
            const defaultValue = isKnown ? getDefaultEnvValue(ctx.envDef.def[varName].schema.def) : undefined;
            refs.push({ varName, known: isKnown, link: link ?? null, defaultValue });
        }

        // Un seul type d'annotation par statement : recommendation si au moins une var connue, sinon ignore
        const hasKnown = refs.some((r) => r.known);
        const annotation: DNLAnnotationType = hasKnown ? DNL_ANNOTATION.recommendation : DNL_ANNOTATION.ignore;

        let comment = `// ${annotation}`;
        for (const r of refs) {
            if (r.link) {
                const displayName = r.varName.includes("-") || r.varName.includes(".") ? `"${r.varName}"` : r.varName;
                comment += `\n// @see ${displayName} in your DNL schema : ${r.link}`;
            }
        }
        if (refs.length === 1 && refs[0].defaultValue) {
            comment += `\n// default value: ${refs[0].defaultValue}`;
        }
        if (!hasKnown) {
            comment += " reason : TODO";
        }

        const message =
            refs.length === 1
                ? hasKnown
                    ? `DNL recommend usage of env.${refs[0].varName}, instead of process.env.${refs[0].varName}`
                    : `DNL ignore process.env.${refs[0].varName}`
                : hasKnown
                  ? `DNL recommend usage of ${refs.map((r) => `env.${r.varName}`).join(", ")}, instead of ${refs.map((r) => `process.env.${r.varName}`).join(", ")}`
                  : `DNL ${hasKnown ? "recommend" : "ignore"} process.env usages: ${refs.map((r) => r.varName).join(", ")}`;

        statement.replaceWithText(`${comment}\n${old}`);
        return { annotation, message };
    },
};
