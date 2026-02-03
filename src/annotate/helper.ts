import { Node, Project } from "ts-morph";
import type { ObjectLiteralElementLike, ObjectLiteralExpression } from "ts-morph";

// Warning, this function is not agnostique to DNL shcema.
// It might not work if shema is splitted into multiple part
// example :
// export default define({ ...part1,...part2})
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
    const pos = nodeForLine.getSourceFile().getLineAndColumnAtPos(nodeForLine.getStart());
    console.log("schemaFile.getFilePath() : ", schemaFile.getFilePath());
    return "file://" + schemaFile.getFilePath() + "#L" + pos.line;
};

function propertyNameMatches(p: ObjectLiteralElementLike, varName: string): boolean {
    if (!Node.isPropertyNamed(p)) return false;
    const nameNode = p.getNameNode();
    const text = nameNode.getText();
    const normalized = text.startsWith('"') || text.startsWith("'") ? text.slice(1, -1) : text;
    return normalized === varName;
}
