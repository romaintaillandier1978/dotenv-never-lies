import { AnnotateRule } from "../types.js";
import { Node, PropertyAccessExpression } from "ts-morph";
import { AnnotateEnvRuleIssue } from "../report.type.js";

export const warnUnknownVarRule: AnnotateRule = {
    name: "ignore",

    match(node, ctx): node is PropertyAccessExpression {
        if (!Node.isPropertyAccessExpression(node)) return false;

        const expr = node.getExpression();
        if (expr.getText() !== "process.env") return false;

        // skip when it's a DNL var (defined in schema)
        const varName = node.getName();
        const envDefKeys = Object.keys(ctx.envDef.def);
        if (envDefKeys.includes(varName)) {
            return false;
        }
        return true;
    },

    async apply(node): Promise<AnnotateEnvRuleIssue> {
        // match() already guarantees this is a PropertyAccessExpression on process.env
        const varName = (node as PropertyAccessExpression).getName();

        const statement = node.getFirstAncestor((n) => Node.isStatement(n));
        if (statement) {
            const old = statement.getText();
            statement.replaceWithText(`// @dnl-ignore reason : TODO\n${old}`);
        }

        return {
            message: `DNL ignore process.env.${varName}`,
        };
    },
};
