import { fallbackRule } from "./rules/fallback.js";
import { ProcessEnvRule, ProcessEnvRuleContext } from "./types.js";
import { Node } from "ts-morph";

const RULES: ProcessEnvRule[] = [fallbackRule];

export const processNodeEngine = async (node: Node, ctx: ProcessEnvRuleContext): Promise<void> => {
    for (const rule of RULES) {
        if (!rule.match(node)) continue;
        // Capturer position et filePath avant apply() : apply() peut modifier l'AST
        // (ex. remplacer le statement) et invalider le node.
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
        if (result.level === "warning") ctx.report.summary.warnings++;
        if (result.action === "comment-added") ctx.report.summary.commentsAdded++;
        if (result.action === "replaced") ctx.report.summary.fixesApplied++;
        return;
    }

    throw new Error("No fallback rule defined");
};
