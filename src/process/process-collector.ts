import { Node, SourceFile } from "ts-morph";

export const collectProcessEnvNodes = (sourceFile: SourceFile): Node[] => {
    return sourceFile.getDescendants().filter((node) => {
        // process.env.X
        if (Node.isPropertyAccessExpression(node)) {
            const expr = node.getExpression();
            const hasProcessEnv = expr.getText() === "process.env";
            if (hasProcessEnv) console.log("process.env.X detected", hasProcessEnv);
            return hasProcessEnv;
        }

        // process.env["X"]
        if (Node.isElementAccessExpression(node)) {
            const expr = node.getExpression();
            const hasProcessEnv = expr.getText() === "process.env";
            if (hasProcessEnv) console.log("process.env['X'] detected", hasProcessEnv);
            return hasProcessEnv;
        }

        return false;
    });
};

/** Un node par statement pour éviter d'invalider des nodes lors des remplacements. */
export const groupNodesByStatement = (nodes: Node[]): Node[] => {
    const byStatement = new Map<number, Node>();
    for (const node of nodes) {
        const statement = node.getFirstAncestor((n) => Node.isStatement(n));
        if (statement) {
            const key = statement.getStart();
            if (!byStatement.has(key)) {
                byStatement.set(key, node);
            }
        }
    }
    return Array.from(byStatement.values());
};
