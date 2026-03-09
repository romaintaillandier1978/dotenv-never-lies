import path from "node:path";
import { Node, Project, type Statement, type ObjectLiteralElementLike, type ObjectLiteralExpression } from "ts-morph";
import { ProcessEnvUsages } from "./ast.types.js";

export const getAnchor = (node: Node): Statement | null => {
    return node.getFirstAncestor((n) => Node.isStatement(n)) ?? null;
};

/** All process.env accesses grouped by statement (key = statement.getStart()). */
export const groupProcessEnvUsagesByStatementMap = (usages: ProcessEnvUsages[]): Map<number, ProcessEnvUsages[]> => {
    const byStatement = new Map<number, ProcessEnvUsages[]>();
    for (const u of usages) {
        if (u.anchor) {
            const key = u.anchor.getStart();
            const list = byStatement.get(key) ?? [];
            list.push(u);
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

// Warning: this function is not agnostic to the DNL schema.
// It might not work if the schema is split into multiple parts,
// e.g.: export default define({ ...part1, ...part2 })
/**
 * Get the link to a variable in the schema file
 * @param project : the ts-morph project
 * @param schemaPath : the path to the schema file
 * @param varName : the name of the variable to get the link to
 * @returns the link to the variable in the schema file
 */
export const getLinkToVar = (project: Project, schemaPath: string, varName: string): string | null => {
    const schemaFile = project.getSourceFile(schemaPath);
    if (!schemaFile) return null;

    // get the default export of the schema file
    const defaultExport = schemaFile.getExportAssignments().find((e) => !e.isExportEquals());
    if (!defaultExport) return null;

    // get the call expression of the default export
    const expr = defaultExport.getExpression();
    if (!Node.isCallExpression(expr)) return null;

    // get the arguments of the call expression
    const args = expr.getArguments();
    const firstArg = args[0];
    if (!firstArg || !Node.isObjectLiteralExpression(firstArg)) return null;

    // get the object literal of the arguments
    const objectLiteral = firstArg as ObjectLiteralExpression;
    // get the property of the object literal
    const prop = objectLiteral.getProperty(varName) ?? objectLiteral.getProperty((p) => propertyNameMatches(p, varName));
    if (!prop) return null;

    // get the node for the line
    const nodeForLine = Node.isPropertyNamed(prop) ? prop.getNameNode() : prop;
    const sourceFile = nodeForLine.getSourceFile();
    const pos = sourceFile.getLineAndColumnAtPos(nodeForLine.getStart());
    const relativePath = getRelativeFilePath(sourceFile);
    // Normalize to slashes for a portable path in the comment (all environments)
    const portablePath = relativePath.split(path.sep).join("/");
    return portablePath + "#L" + pos.line;
};

export const getRelativeFilePath = (node: Node): string => {
    const projectRoot = process.cwd();
    const absolutePath = node.getSourceFile().getFilePath();
    const relativePath = path.relative(projectRoot, absolutePath);
    return relativePath.split(path.sep).join("/");
};

function propertyNameMatches(p: ObjectLiteralElementLike, varName: string): boolean {
    if (!Node.isPropertyNamed(p)) return false;
    const nameNode = p.getNameNode();
    const text = nameNode.getText();
    const normalized = text.startsWith('"') || text.startsWith("'") ? text.slice(1, -1) : text;
    return normalized === varName;
}
