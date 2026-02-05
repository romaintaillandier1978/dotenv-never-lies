import { Node, Project } from "ts-morph";
import type { CommentRange, ObjectLiteralElementLike, ObjectLiteralExpression } from "ts-morph";
import { DNL_ANNOTATION, DNLAnnotationType } from "./report.type.js";

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
    return "file://" + schemaFile.getFilePath() + "#L" + pos.line;
};

function propertyNameMatches(p: ObjectLiteralElementLike, varName: string): boolean {
    if (!Node.isPropertyNamed(p)) return false;
    const nameNode = p.getNameNode();
    const text = nameNode.getText();
    const normalized = text.startsWith('"') || text.startsWith("'") ? text.slice(1, -1) : text;
    return normalized === varName;
}

export const getAnchor = (node: Node): Node | null => {
    return node.getFirstAncestor((n) => Node.isStatement(n)) ?? null;
};
/**
 * Check if the statement has a DNL annotation
 * @param statement : the statement to check
 * @param annotation : the annotation to check (optional). If undefined, check for any DNL annotation.
 * @returns true if the statement has a DNL annotation, false otherwise
 */
export const hasDnlAnnotation = (statement: Node, annotation: DNLAnnotationType | undefined = undefined): boolean => {
    const ranges = statement.getLeadingCommentRanges();
    if (!ranges || ranges.length < 1) return false;

    if (annotation) {
        return ranges.some((c) => c.getText().includes(annotation));
    }
    return ranges.some((c) => Object.values(DNL_ANNOTATION).some((a) => c.getText().includes(a)));
};

/**
 * Get the DNL annotation of the statement
 * @param statement : the statement to check
 * @returns the DNL annotation of the statement, or null if no annotation is found
 */
export const getDnlAnnotation = (statement: Node): { ranges: CommentRange[]; annotationType: DNLAnnotationType } | null => {
    const ranges = statement.getLeadingCommentRanges();

    // if there are other comments above the dnl annotation, we ignore them (to not delete them, they are not ours)
    while (ranges.length > 0 && !ranges[0].getText().includes("@dnl-")) {
        ranges.shift();
    }
    if (ranges.length < 1) return null;

    // This double loop is only to get the annotation type,
    let annotationType: DNLAnnotationType = DNL_ANNOTATION.recommendation;
    for (const range of ranges) {
        const text = range.getText();
        let found = false;
        for (const annotation of Object.values(DNL_ANNOTATION)) {
            if (text.includes(annotation)) {
                annotationType = annotation;
                found = true; // to break the for above.
                break;
            }
        }
        if (found) {
            break;
        }
    }
    // here i know that annotationType is not null,
    // because passed throw match of a rule.
    // So lets set a default in fallback, but should not happen.
    return { ranges, annotationType };
};
