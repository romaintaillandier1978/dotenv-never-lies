import { ProcessEnvRule } from "../types.js";
import { ProcessEnvRuleIssue } from "../report.type.js";
import { Node } from "ts-morph";

export const fallbackRule: ProcessEnvRule = {
    name: "fallback-unsupported-usage",

    match() {
        return true;
    },

    async apply(node, ctx): Promise<ProcessEnvRuleIssue> {
        console.log("fallbackRule apply");
        if (ctx.isFixMode) {
            const statement = node.getFirstAncestor((n) => Node.isStatement(n));
            console.log("sourceFile : ", ctx.sourceFile.getFilePath());
            console.log("statement : ", statement?.getText());
            if (statement) {
                const old = statement.getText();
                const result = statement.replaceWithText(`// @dnl-warning unsupported process.env usage\n${old}`);
                console.log("statement replaced : ", result?.getText());
            }
        }

        return {
            level: "warning",
            message: "unsupported process.env usage",
            action: ctx.isFixMode ? "comment-added" : "none",
        };
    },
};
