import { Node, SourceFile } from "ts-morph";
import { getAnchor } from "../ast-tools/ast-helpers.js";
import { ProcessEnvAccess } from "../ast-tools/ast.types.js";

export const collectProcessEnvAccesses = (sourceFile: SourceFile): ProcessEnvAccess[] => {
    const accesses: ProcessEnvAccess[] = [];
    const relativeFilePath = sourceFile.getFilePath();
    for (const node of sourceFile.getDescendants()) {
        const pos = node.getSourceFile().getLineAndColumnAtPos(node.getStart());

        const anchor = getAnchor(node);
        if (!anchor) continue;
        // process.env.X
        if (Node.isPropertyAccessExpression(node)) {
            const expr = node.getExpression();

            // process.env.X
            if (expr.getText() === "process.env") {
                accesses.push({ node, kind: "static", varName: node.getName(), anchor, relativeFilePath, pos });
                continue;
            }

            // process.env (global access) — only if it is not a sub-node of process.env.X or process.env[...]
            if (Node.isIdentifier(expr) && expr.getText() === "process" && node.getName() === "env") {
                const parent = node.getParent();
                const isSubNodeOfSpecificAccess = parent && (Node.isPropertyAccessExpression(parent) || Node.isElementAccessExpression(parent));
                if (!isSubNodeOfSpecificAccess) {
                    accesses.push({ node, kind: "global", anchor, relativeFilePath, pos });
                }
                continue;
            }
        }

        // process.env["X"] | process.env[key]
        if (Node.isElementAccessExpression(node)) {
            const expr = node.getExpression();

            if (expr.getText() === "process.env") {
                const arg = node.getArgumentExpression();

                // process.env["X"]
                if (Node.isStringLiteral(arg)) {
                    accesses.push({ node, kind: "static", varName: arg.getLiteralText(), anchor, relativeFilePath, pos });
                }
                // process.env[key]
                else {
                    accesses.push({ node, kind: "dynamic", anchor, relativeFilePath, pos });
                }

                continue;
            }
        }
    }

    return accesses;
};

/** All process.env accesses grouped by statement (key = statement.getStart()). */
export const groupProcessEnvAccessesByStatementMap = (accesses: ProcessEnvAccess[]): Map<number, ProcessEnvAccess[]> => {
    const byStatement = new Map<number, ProcessEnvAccess[]>();
    for (const access of accesses) {
        if (access.anchor) {
            const key = access.anchor.getStart();
            const list = byStatement.get(key) ?? [];
            list.push(access);
            byStatement.set(key, list);
        }
    }
    return byStatement;
};

/**
 * Returns the environment variable name for a process.env.X or process.env["X"] node.
 */
export const getProcessEnvVarName = (node: Node): string | null => {
    if (Node.isPropertyAccessExpression(node)) {
        return node.getName();
    }
    if (Node.isElementAccessExpression(node)) {
        const arg = node.getArgumentExpression();
        if (!arg) return null;
        const text = arg.getText();
        // Strip single or double quotes
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
            return text.slice(1, -1);
        }
        return text;
    }
    return null;
};
