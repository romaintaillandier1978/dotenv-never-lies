import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue } from "../report.type.js";
import { Node, PropertyAccessExpression } from "ts-morph";
import { getLinkToVar } from "../helper.js";
import { getDefaultEnvValue } from "../../cli/utils/printer.js";

export const fallbackRule: AnnotateRule = {
    name: "recommendation",

    match(node) {
        if (node.getText().includes("@dnl-annotation")) return false;
        return true;
    },

    async apply(node, ctx): Promise<AnnotateEnvRuleIssue> {
        // match() already guarantees this is a PropertyAccessExpression on process.env
        const varName = (node as PropertyAccessExpression).getName();
        const statement = node.getFirstAncestor((n) => Node.isStatement(n));
        if (statement) {
            const old = statement.getText();

            const link = getLinkToVar(ctx.project, ctx.schemaPath, varName);
            const defaultValue = getDefaultEnvValue(ctx.envDef.def[varName].schema.def);
            let comment = `// @dnl-annotation ${this.name}\n// @see ${varName} in your DNL schema : ${link}`;
            if (defaultValue) comment += `\n// default value: ${defaultValue}`;

            statement.replaceWithText(`${comment}\n${old}`);
        }

        return {
            message: `DNL recommend usage of env.${varName}, instead of process.env.${varName}`,
        };
    },
};
