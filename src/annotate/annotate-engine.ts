import path from "node:path";
import { AnnotateRule, AnnotateRuleContext } from "./types.js";
import { addAnnotationRule } from "./rules/add.js";
import { removeAnnotationRule } from "./rules/remove.js";
import { checkAnnotationRule } from "./rules/check.js";
import { ProcessEnvAccess } from "../ast-tools/ast.types.js";

const RULES_ANNOTATE: AnnotateRule[] = [addAnnotationRule];
const RULES_REMOVE: AnnotateRule[] = [removeAnnotationRule];
const RULES_CHECK: AnnotateRule[] = [checkAnnotationRule];

/**
 * Processes a statement: all nodes are process.env usages from the same statement.
 * A single issue is produced per statement.
 */
export const annotateEngine = async (accesses: ProcessEnvAccess[], ctx: AnnotateRuleContext): Promise<void> => {
    if (accesses.length === 0) return;
    const rules = ctx.mode === "remove" ? RULES_REMOVE : ctx.mode === "check" ? RULES_CHECK : RULES_ANNOTATE;
    for (const rule of rules) {
        if (!rule.match(accesses, ctx)) continue;
        // Capture position and filePath before apply(): apply() may modify the AST
        const filePath = path.relative(process.cwd(), ctx.sourceFile.getFilePath());

        const issues = await rule.apply(accesses, ctx);

        for (const issue of issues) {
            ctx.report.issues.push({
                filePath,
                ...issue,
            });
            ctx.report.summary.accessesProcessed++;

            switch (ctx.mode) {
                case "remove":
                    ctx.report.summary.commentsRemoved++;
                    break;
                case "check":
                    if (issue.checkLevel === "error") {
                        ctx.report.summary.checkErrors++;
                    } else if (issue.checkLevel === "warning") {
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
        }

        return;
    }
};
