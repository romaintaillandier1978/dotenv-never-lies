import { Node } from "ts-morph";
import type { CommentRange } from "ts-morph";
import { DNL_ANNOTATION, DNLAnnotationType } from "./report.type.js";

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
export const getDnlAnnotation = (statement: Node): { ranges: CommentRange[]; annotationTypes: DNLAnnotationType[] | null } | null => {
    const ranges = statement.getLeadingCommentRanges();

    // if there are other comments above the dnl annotation, we ignore them (to not delete them, they are not ours)
    while (ranges.length > 0 && !ranges[0].getText().includes("@dnl-")) {
        ranges.shift();
    }
    if (ranges.length < 1) return null;

    // Collect annotations in the order of their first occurrence in the text
    const annotationTypes: DNLAnnotationType[] = [];
    for (const range of ranges) {
        const text = range.getText();
        const withPosition: { annotation: DNLAnnotationType; index: number }[] = [];
        for (const annotation of Object.values(DNL_ANNOTATION)) {
            const index = text.indexOf(annotation);
            if (index !== -1) {
                withPosition.push({ annotation, index });
            }
        }
        withPosition.sort((a, b) => a.index - b.index);
        for (const { annotation } of withPosition) {
            annotationTypes.push(annotation);
        }
    }
    // We know annotationType is not null here (passed through a rule's match).
    // Set a default in fallback, but this should not happen.
    return { ranges, annotationTypes };
};

/**
 * Get the DNL annotation of the statement
 * @param statement : the statement to check
 * @returns the DNL annotation of the statement, or null if no annotation is found
 */
export const getDnlAnnotationType = (statement: Node): DNLAnnotationType | null => {
    const ranges = statement.getLeadingCommentRanges();

    // if there are other comments above the dnl annotation, we ignore them (to not delete them, they are not ours)
    while (ranges.length > 0 && !ranges[0].getText().includes("@dnl-")) {
        ranges.shift();
    }
    if (ranges.length < 1) return null;

    for (const range of ranges) {
        const text = range.getText();
        let earliest: { annotation: DNLAnnotationType; index: number } | null = null;
        for (const annotation of Object.values(DNL_ANNOTATION)) {
            const index = text.indexOf(annotation);
            if (index !== -1 && (earliest === null || index < earliest.index)) {
                earliest = { annotation, index };
            }
        }
        if (earliest !== null) return earliest.annotation;
    }
    return null;
};
