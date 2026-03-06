import { Node, SourceFile } from "ts-morph";
import { getAnchor } from "../ast-tools/ast-helpers.js";
import { ProcessEnvUsages } from "../ast-tools/ast.types.js";

export const collectProcessEnvUsages = (sourceFile: SourceFile): ProcessEnvUsages[] => {
    const accesses: ProcessEnvUsages[] = [];
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
