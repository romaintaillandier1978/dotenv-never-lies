import { Node, Project, SourceFile, SyntaxKind } from "ts-morph";
import { getAnchor, getRelativeFilePath } from "../../ast-tools/ast-helpers.js";
import { _ProcessEnvAccess, ProcessEnvAccess } from "../../ast-tools/ast.types.js";

/**
 * Collects all static process.env accesses that provide a fallback value in the source file.
 * @param sourceFile A source file.
 * @returns An array of process.env accesses.
 */
const collectProcessEnvAccesses = (sourceFile: SourceFile): ProcessEnvAccess[] => {
    const accesses: ProcessEnvAccess[] = [];
    for (const node of sourceFile.getDescendants()) {
        // const isExample = sourceFile.getFilePath().includes("/Volumes/Documents/PersoRTA/dotenv-never-lies/src/sample/process-env.example.ts");
        const relativeFilePath = getRelativeFilePath(node);
        const pos = node.getSourceFile().getLineAndColumnAtPos(node.getStart());

        const anchor = getAnchor(node);
        if (!anchor) continue;

        // First look for destructuring assignments,
        // e.g.: const { PORT = 3000, API_URL = "http://localhost:3000" } = process.env ;
        const fallbacks = extractDestructuringFallbackValue(node);
        if (fallbacks.length > 0) {
            // Node was of this type; create all fallbacks.
            for (const fallback of fallbacks) {
                accesses.push({
                    node,
                    kind: "static",
                    varName: fallback.varName,
                    anchor,
                    relativeFilePath,
                    pos,
                    defaultValue: fallback.defaultValue,
                });
            }
            // Done with this node; continue with the next one.
            continue;
        }

        // Now look for process.env.port ?? "3000" or process.env["port"] || "3000"
        const fallback = hasFallbackValue(node);
        if (fallback) {
            accesses.push({
                node,
                kind: "static",
                varName: fallback.varName,
                anchor,
                relativeFilePath,
                pos,
                defaultValue: fallback.defaultValue,
            });
        }
    }
    return accesses;
};

/**
 * Detects a fallback value via destructuring; returns variables and their default values.
 * Example: const { PORT = 3000, API_URL = "http://localhost:3000" } = process.env ;
 * @param node Any AST node.
 * @returns { varName: string; defaultValue: string }[] Variables and their default values.
 */
const extractDestructuringFallbackValue = (node: Node): { varName: string; defaultValue: string }[] => {
    const values: { varName: string; defaultValue: string }[] = [];

    if (Node.isVariableDeclaration(node)) {
        const initializer = node.getInitializer();
        const nameNode = node.getNameNode();

        if (initializer && initializer.getText() === "process.env" && Node.isObjectBindingPattern(nameNode)) {
            for (const element of nameNode.getElements()) {
                const elementDefault = element.getInitializer();
                if (!elementDefault || !isLiteralNode(elementDefault)) continue;

                values.push({ varName: element.getName(), defaultValue: elementDefault.getText() });
            }
        }
    }
    return values;
};

/**
 * Returns true if the node is a static access to process.env (process.env.X or process.env["X"]).
 * @param node Any AST node
 * @returns true if the node is a static process.env access.
 */
const getProcessEnvVariableName = (node: Node): string | undefined => {
    // Possible improvement: handle (globalThis.process).env.
    if (Node.isPropertyAccessExpression(node)) {
        const expr = node.getExpression();
        // process.env.X
        if (expr.getText() === "process.env") {
            return node.getName();
        }
    }
    if (Node.isElementAccessExpression(node)) {
        const expr = node.getExpression();
        const arg = node.getArgumentExpression();

        if (expr.getText() === "process.env" && arg && Node.isStringLiteral(arg)) {
            return arg.getLiteralText();
        }
    }
    return undefined;
};

/**
 * Checks whether the node has process.env.X or process.env["X"] with a fallback value ?? "3003" or || "3003".
 * @param node Any AST node.
 * @returns { varName: string; defaultValue: string } if the node has a fallback value, undefined otherwise.
 */
const hasFallbackValue = (node: Node): { varName: string; defaultValue: string } | undefined => {
    const varName = getProcessEnvVariableName(node);
    if (!varName) return undefined;

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
                return { varName, defaultValue: right.getText() };
            }
        }
    }
    return undefined;
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
 * Collects all static process.env accesses that provide a fallback value, grouped by variable name.
 * @returns A map of process.env accesses by variable name.
 */
export const collectProcessEnvAccessesByName = (): Map<string, _ProcessEnvAccess<"static">[]> => {
    // Find all ts files in the user project:
    const project = new Project({
        tsConfigFilePath: "tsconfig.json",
    });
    const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");

    const accessesByVariableName: Map<string, _ProcessEnvAccess<"static">[]> = new Map();

    for (const sourceFile of sourceFiles) {
        const accesses = collectProcessEnvAccesses(sourceFile);

        for (const access of accesses) {
            if (access.kind === "static") {
                const variableName = access.varName;
                const list = accessesByVariableName.get(variableName) ?? [];
                list.push(access);
                accessesByVariableName.set(variableName, list);
            }
        }
    }

    return accessesByVariableName;
};
