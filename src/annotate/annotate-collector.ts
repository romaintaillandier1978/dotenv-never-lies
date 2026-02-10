import { Node, SourceFile } from "ts-morph";
import { getAnchor } from "./helper.js";
type EmptyObject = Record<never, never>;

export type ProcessEnvAccessKind =
    | "global" // process.env
    | "static" // process.env.X | process.env["X"]
    | "dynamic"; // process.env[key]

type _ProcessEnvAccess<T extends ProcessEnvAccessKind> = {
    kind: T;
    node: Node;
    anchor: Node;
    pos: { line: number; column: number };
} & (T extends "static" ? { varName: string } : EmptyObject);

export type ProcessEnvAccess<T extends ProcessEnvAccessKind = ProcessEnvAccessKind> = { [key in ProcessEnvAccessKind]: _ProcessEnvAccess<key> }[T];

export const collectProcessEnvAccesses = (sourceFile: SourceFile): ProcessEnvAccess[] => {
    const accesses: ProcessEnvAccess[] = [];
    for (const node of sourceFile.getDescendants()) {
        const pos = node.getSourceFile().getLineAndColumnAtPos(node.getStart());

        const anchor = getAnchor(node);
        if (!anchor) continue;
        // process.env.X
        if (Node.isPropertyAccessExpression(node)) {
            const expr = node.getExpression();

            // process.env.X
            if (expr.getText() === "process.env") {
                accesses.push({ node, kind: "static", varName: node.getName(), anchor, pos });
                continue;
            }

            // process.env (global access) — seulement si ce n'est pas un sous-node de process.env.X ou process.env[...]
            if (Node.isIdentifier(expr) && expr.getText() === "process" && node.getName() === "env") {
                const parent = node.getParent();
                const isSubNodeOfSpecificAccess = parent && (Node.isPropertyAccessExpression(parent) || Node.isElementAccessExpression(parent));
                if (!isSubNodeOfSpecificAccess) {
                    accesses.push({ node, kind: "global", anchor, pos });
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
                    accesses.push({ node, kind: "static", varName: arg.getLiteralText(), anchor, pos });
                }
                // process.env[key]
                else {
                    accesses.push({ node, kind: "dynamic", anchor, pos });
                }

                continue;
            }
        }
    }

    return accesses;
};

/** Tous les accès process.env groupés par statement (clé = statement.getStart()). */
export const groupProcessEnvAccessesByStatementMap = (accesses: ProcessEnvAccess[]): Map<number, ProcessEnvAccess[]> => {
    const byStatement = new Map<number, ProcessEnvAccess[]>();
    for (const access of accesses) {
        const statement = access.node.getFirstAncestor((n) => Node.isStatement(n));
        if (statement) {
            const key = statement.getStart();
            const list = byStatement.get(key) ?? [];
            list.push(access);
            byStatement.set(key, list);
        }
    }
    return byStatement;
};

/**
 * Retourne le nom de la variable d'environnement pour un node process.env.X ou process.env["X"].
 */
export const getProcessEnvVarName = (node: Node): string | null => {
    if (Node.isPropertyAccessExpression(node)) {
        return node.getName();
    }
    if (Node.isElementAccessExpression(node)) {
        const arg = node.getArgumentExpression();
        if (!arg) return null;
        const text = arg.getText();
        // Enlever les guillemets simples ou doubles
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
            return text.slice(1, -1);
        }
        return text;
    }
    return null;
};
