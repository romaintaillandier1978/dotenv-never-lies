import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, RemovalRange } from "../report.type.js";
import { getDnlAnnotation, hasDnlAnnotation } from "../helper.js";

export const removeAnnotationRule: AnnotateRule = {
    match(processEnvAccesses) {
        // If at least one has an annotation, we need to remove it
        if (processEnvAccesses.some((pea) => hasDnlAnnotation(pea.anchor))) return true;
        return false;
    },

    async apply(processEnvAccesses): Promise<AnnotateEnvRuleIssue[]> {
        // We want to remove the comments added by the Add rule.
        // Add takes the same parameter as remove.
        // Add builds a single comment for all AnnotateEnvRuleIssue in a group.

        // So we only have one block to remove, the first we find!
        // But we still try to detect all annotations we are going to remove.
        const issues: AnnotateEnvRuleIssue[] = [];
        let detected = false;
        const hasAnnotation = hasDnlAnnotation(processEnvAccesses[0].anchor);
        const dnlAnnotation = getDnlAnnotation(processEnvAccesses[0].anchor);
        const ranges = dnlAnnotation?.ranges ?? [];
        const first = ranges.reduce((min, r) => (r.getPos() < min.getPos() ? r : min), ranges[0]);

        for (let i = 0; i < processEnvAccesses.length; i++) {
            if (!hasAnnotation || !dnlAnnotation || dnlAnnotation.ranges.length < 1) {
                // We should not be here!
                continue;
            }

            const pea = processEnvAccesses[i];

            const annotation = dnlAnnotation?.annotationTypes?.[i] ?? null;
            const removalRange: RemovalRange = { start: first?.getPos() ?? 0, end: pea.anchor.getStart() };

            const issue: AnnotateEnvRuleIssue = {
                nodeText: pea.node.getText(),
                annotation,
                messages: [],
                pos: pea.pos,
                removalRange: detected ? undefined : removalRange,
            };
            issues.push(issue);
            detected = true;
        }
        return issues;
    },
};
