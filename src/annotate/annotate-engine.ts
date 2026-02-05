import { AnnotateRule, AnnotateRuleContext } from "./types.js";
import { Node } from "ts-morph";
import { simpleAnnotationRule } from "./rules/simple-annotation.js";
import { removeAnnotationRule } from "./rules/remove-annotation.js";

const RULES: AnnotateRule[] = [simpleAnnotationRule];
const RULES_REMOVE: AnnotateRule[] = [removeAnnotationRule];

export const annotateEngine = async (node: Node, remove: boolean, ctx: AnnotateRuleContext): Promise<void> => {
    const rules = remove ? RULES_REMOVE : RULES;
    for (const rule of rules) {
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
            ...result,
        });

        if (remove) {
            ctx.report.summary.commentsRemoved++;
        } else {
            ctx.report.summary.commentsAdded++;
        }

        return;
    }

    console.warn(`No rule found for node: ${node.getText()}`);
};
