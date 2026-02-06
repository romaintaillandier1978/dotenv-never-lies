import { Node, SourceFile } from "ts-morph";

export const collectProcessEnvNodes = (sourceFile: SourceFile): Node[] => {
    return sourceFile.getDescendants().filter((node) => {
        // process.env.X
        if (Node.isPropertyAccessExpression(node)) {
            const expr = node.getExpression();
            const hasProcessEnv = expr.getText() === "process.env";
            // if (hasProcessEnv) console.log("process.env.X detected", hasProcessEnv);
            return hasProcessEnv;
        }

        // process.env["X"]
        if (Node.isElementAccessExpression(node)) {
            const expr = node.getExpression();
            const hasProcessEnv = expr.getText() === "process.env";
            //if (hasProcessEnv) console.log("process.env['X'] detected", hasProcessEnv);
            return hasProcessEnv;
        }

        return false;
    });
};

/** Tous les nodes process.env groupés par statement (clé = statement.getStart()). */
export const groupNodesByStatementMap = (nodes: Node[]): Map<number, Node[]> => {
    const byStatement = new Map<number, Node[]>();
    for (const node of nodes) {
        const statement = node.getFirstAncestor((n) => Node.isStatement(n));
        if (statement) {
            const key = statement.getStart();
            const list = byStatement.get(key) ?? [];
            list.push(node);
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
