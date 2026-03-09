import { Node, SourceFile, SyntaxKind } from "ts-morph";
import { getAnchor, getRelativeFilePath } from "../ast-tools/ast-helpers.js";
import { ProcessEnvUsages } from "../ast-tools/ast.types.js";

// technical debt: expr.getText() === "process.env" is fragile
// we don't support (globalThis.process).env.PORT

/**
 * Collects all process.env usages from a source file.
 * @param sourceFile - The source file to collect process.env usages from.
 * @returns An array of process.env usages.
 */
export const collectProcessEnvUsages = (sourceFile: SourceFile): ProcessEnvUsages[] => {
    const accesses: ProcessEnvUsages[] = [];
    const relativeFilePath = getRelativeFilePath(sourceFile);
    for (const node of sourceFile.getDescendants()) {
        const pos = node.getSourceFile().getLineAndColumnAtPos(node.getStart());

        const anchor = getAnchor(node);
        if (!anchor) continue;

        // First look for destructuring assignments,
        // e.g.: const { PORT = 3000, API_URL = "http://localhost:3000" } = process.env ;
        const destructured = extractDestructuring(node);
        if (destructured.length > 0) {
            for (const entry of destructured) {
                accesses.push({
                    node,
                    kind: "destructured",
                    varName: entry.varName,
                    anchor,
                    relativeFilePath,
                    pos,
                    fallbackLiteral: entry.fallback,
                });
            }
            continue;
        }

        // process.env.X
        if (Node.isPropertyAccessExpression(node)) {
            const expr = node.getExpression();

            // process.env.X
            // orprocess.env.PORT ?? "3000"
            // or process.env.PORT || "3000"
            if (expr.getText() === "process.env") {
                const varName = node.getName();
                const fallback = hasFallbackValue(node);
                accesses.push({ node, kind: "static", varName, anchor, relativeFilePath, pos, fallbackLiteral: fallback });
                // Done with this node; continue with the next one.
                continue;
            }

            // process.env (global access) — only if it is not a sub-node of process.env.X or process.env[...]
            if (Node.isIdentifier(expr) && expr.getText() === "process" && node.getName() === "env") {
                const parent = node.getParent();
                // Ignore destructuring initializer:
                // const { PORT } = process.env
                if (Node.isVariableDeclaration(parent) && parent.getInitializer() === node) {
                    continue;
                }

                const isSubNodeOfSpecificAccess = parent && (Node.isPropertyAccessExpression(parent) || Node.isElementAccessExpression(parent));
                if (!isSubNodeOfSpecificAccess) {
                    accesses.push({ node, kind: "global", anchor, relativeFilePath, pos });
                }
                // Done with this node; continue with the next one.
                continue;
            }
        }

        // process.env["X"] | process.env[key]
        if (Node.isElementAccessExpression(node)) {
            const expr = node.getExpression();

            if (expr.getText() === "process.env") {
                const arg = node.getArgumentExpression();
                const fallbackLiteral = hasFallbackValue(node);

                // process.env["X"]
                // or process.env["X"] ?? "3000"
                // or process.env["X"] || "3000"
                if (Node.isStringLiteral(arg)) {
                    const varName = arg.getLiteralText();
                    accesses.push({ node, kind: "static", varName, anchor, relativeFilePath, pos, fallbackLiteral });
                }
                // process.env[key]
                else {
                    accesses.push({ node, kind: "dynamic", anchor, relativeFilePath, pos, fallbackLiteral });
                }

                // Done with this node; continue with the next one.
                continue;
            }
        }
    }

    return accesses;
};

/**
 * Detects a fallback value via destructuring; returns variables and their default values.
 * Example:
 *  - const { PORT, API_URL } = process.env; # destructuring
 *  - const { PORT = 3000, API_URL = "http://localhost:3000" } = process.env ; # with fallback
 *  - const { PORT: MY_PORT = 3000 } = process.env; # with alias
 * @param node Any AST node.
 * @returns { varName: string; fallback?: string }[] Variables and their default values.
 */
const extractDestructuring = (node: Node): { varName: string; fallback?: string }[] => {
    const values: { varName: string; fallback?: string }[] = [];

    if (!Node.isVariableDeclaration(node)) return values;

    const initializer = node.getInitializer();
    const nameNode = node.getNameNode();

    if (!initializer || initializer.getText() !== "process.env") return values;
    if (!Node.isObjectBindingPattern(nameNode)) return values;

    for (const element of nameNode.getElements()) {
        // propertyName = original env key (PORT)
        // name = local variable name (MY_PORT)
        const propertyNameNode = element.getPropertyNameNode();
        const varName = propertyNameNode ? propertyNameNode.getText() : element.getName();

        const elementDefault = element.getInitializer();
        const fallback = elementDefault && isLiteralNode(elementDefault) ? elementDefault.getText() : undefined;

        values.push({
            varName,
            fallback,
        });
    }

    return values;
};

export const isLiteralNode = (node: Node): boolean => {
    return (
        Node.isStringLiteral(node) ||
        Node.isNumericLiteral(node) ||
        Node.isNoSubstitutionTemplateLiteral(node) ||
        node.getKind() === SyntaxKind.TrueKeyword ||
        node.getKind() === SyntaxKind.FalseKeyword ||
        node.getKind() === SyntaxKind.NullKeyword
    );
};

/**
 * Checks whether the node has process.env.X or process.env["X"] with a fallback value ?? "3003" or || "3003".
 * @param node Any AST node.
 * @returns { varName: string; defaultValue: string } if the node has a fallback value, undefined otherwise.
 */
const hasFallbackValue = (node: Node): string | undefined => {
    const parent = node.getParent();
    // Case 1: detect a fallback value via `||` or `??`
    // Example: || "4000"; we don't know if it's a process.env fallback, only that there is a default value.
    if (Node.isBinaryExpression(parent)) {
        const operator = parent.getOperatorToken().getKind();
        const isLogicalOr = operator === SyntaxKind.BarBarToken;
        const isNullish = operator === SyntaxKind.QuestionQuestionToken;

        if ((isLogicalOr || isNullish) && parent.getLeft() === node) {
            const right = parent.getRight();
            if (isLiteralNode(right)) {
                return right.getText();
            }
        }
    }
    return undefined;
};
