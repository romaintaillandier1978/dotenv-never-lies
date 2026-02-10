import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, RemovalRange } from "../report.type.js";
import { getDnlAnnotation, hasDnlAnnotation } from "../helper.js";

export const removeAnnotationRule: AnnotateRule = {
    match(processEnvAccesses) {
        // si un seul a une annotation, on devra la supprimer
        if (processEnvAccesses.some((pea) => hasDnlAnnotation(pea.anchor))) return true;
        return false;
    },

    async apply(processEnvAccesses): Promise<AnnotateEnvRuleIssue[]> {
        // ici, on veut supprimer les commentaires ajoutés par la rule Add.
        // add prend le même paramètre que remove.
        // Add construit un seul commentaire pour toute les AnnotateEnvRuleIssue d'un groupe.

        // donc on a qu'un bloc a supprimer, le premier qu'on trouve !
        // Mais on va quand même essayer de détecter toutes les annotation qu'on va supprimer.
        const issues: AnnotateEnvRuleIssue[] = [];
        let detected = false;
        const hasAnnotation = hasDnlAnnotation(processEnvAccesses[0].anchor);
        const dnlAnnotation = getDnlAnnotation(processEnvAccesses[0].anchor);
        const ranges = dnlAnnotation?.ranges ?? [];
        const first = ranges.reduce((min, r) => (r.getPos() < min.getPos() ? r : min), ranges[0]);

        for (let i = 0; i < processEnvAccesses.length; i++) {
            if (!hasAnnotation || !dnlAnnotation || dnlAnnotation.ranges.length < 1) {
                // On devrait pas être la !
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
