import { AnnotateRule, AnnotateRuleContext } from "./types.js";
import { Node } from "ts-morph";
import { addAnnotationRule } from "./rules/add.js";
import { removeAnnotationRule } from "./rules/remove.js";
import { checkAnnotationRule } from "./rules/check.js";

const RULES_ANNOTATE: AnnotateRule[] = [addAnnotationRule];
const RULES_REMOVE: AnnotateRule[] = [removeAnnotationRule];
const RULES_CHECK: AnnotateRule[] = [checkAnnotationRule];

/**
 * Traite un statement : tous les nodes sont des usages process.env du même statement.
 * Une seule issue est produite par statement.
 */
export const annotateEngine = async (nodes: Node[], ctx: AnnotateRuleContext): Promise<void> => {
    if (nodes.length === 0) return;
    const firstNode = nodes[0];
    const rules = ctx.mode === "remove" ? RULES_REMOVE : ctx.mode === "check" ? RULES_CHECK : RULES_ANNOTATE;
    for (const rule of rules) {
        if (!rule.match(firstNode, ctx)) continue;
        // Capture position and filePath before apply(): apply() may modify the AST
        const pos = firstNode.getSourceFile().getLineAndColumnAtPos(firstNode.getStart());
        const filePath = ctx.sourceFile.getFilePath();

        const result = await rule.apply(nodes, ctx);

        ctx.report.summary.nodesProcessed++;
        ctx.report.issues.push({
            filePath,
            line: pos.line,
            column: pos.column,
            ...result,
        });

        switch (ctx.mode) {
            case "remove":
                ctx.report.summary.commentsRemoved++;
                break;
            case "check":
                if (result.checkLevel === "error") {
                    ctx.report.summary.checkErrors++;
                } else if (result.checkLevel === "warning") {
                    if (ctx.warnAsError) {
                        ctx.report.summary.checkErrors++;
                    } else {
                        ctx.report.summary.checkWarnings++;
                    }
                }
                break;
            case "add":
                ctx.report.summary.commentsAdded++;
                break;
        }

        return;
    }
};
