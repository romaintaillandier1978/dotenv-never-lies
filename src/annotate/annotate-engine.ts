import { fallbackRule } from "./rules/recommandation.js";
import { warnUnknownVarRule } from "./rules/ignore.js";
import { AnnotateRule, AnnotateRuleContext } from "./types.js";
import { Node } from "ts-morph";

const RULES: AnnotateRule[] = [warnUnknownVarRule, fallbackRule];

export const annotateEngine = async (node: Node, ctx: AnnotateRuleContext): Promise<void> => {
    for (const rule of RULES) {
        if (!rule.match(node, ctx)) continue;
        // Capture position and filePath before apply(): apply() may modify the AST
        // (e.g. replace the statement) and invalidate the node.
        const pos = node.getSourceFile().getLineAndColumnAtPos(node.getStart());
        const filePath = ctx.sourceFile.getFilePath();

        const result = await rule.apply(node, ctx);

        ctx.report.summary.nodesProcessed++;
        ctx.report.issues.push({
            filePath,
            line: pos.line,
            column: pos.column,
            ruleName: rule.name,
            ...result,
        });

        ctx.report.summary.commentsAdded++;
        return;
    }

    console.warn(`No rule found for node: ${node.getText()}`);
};
