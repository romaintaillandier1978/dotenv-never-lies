import { AnnotateRule } from "../types.js";
import { AnnotateEnvRuleIssue, DNL_ANNOTATION } from "../report.type.js";
import { getDnlAnnotationType, hasDnlAnnotation } from "../helper.js";
import { ProcessEnvAccess } from "../annotate-collector.js";

export const checkAnnotationRule: AnnotateRule = {
    match(processEnvAccesses) {
        function matchOne(pea: ProcessEnvAccess): boolean {
            if (!hasDnlAnnotation(pea.anchor)) return true;
            if (getDnlAnnotationType(pea.anchor) === DNL_ANNOTATION.ignore) return false;
            return true;
        }

        return processEnvAccesses.some((pea) => matchOne(pea));
    },

    async apply(processEnvAccesses): Promise<AnnotateEnvRuleIssue[]> {
        const issues: AnnotateEnvRuleIssue[] = [];

        for (let i = 0; i < processEnvAccesses.length; i++) {
            const pea = processEnvAccesses[i];
            const noAnnotationIssue: AnnotateEnvRuleIssue = {
                annotation: null,
                messages: [`No DNL annotation found for  ${pea.node.getText()}`],
                checkLevel: "error",
                nodeText: pea.node.getText(),
            };

            const anchor = pea.anchor;
            // Si aucune annotation => Erreur !
            if (!anchor || !hasDnlAnnotation(anchor)) {
                issues.push(noAnnotationIssue);
                continue;
            }

            // Si ona a une annotation, on la récupère et on crée l'issue correspondante.
            const annotation = getDnlAnnotationType(anchor);
            const issue: AnnotateEnvRuleIssue = {
                nodeText: pea.node.getText(),
                annotation,
                messages: [],
                pos: pea.pos,
            };
            switch (annotation) {
                case null:
                    issues.push(noAnnotationIssue);
                    break;
                case DNL_ANNOTATION.ignore:
                    // normalement ce cas est écarté par match, avant d'arriver dans apply.
                    // On laisse le case, pour faire créer de résultat vide, ou absurde, mais ca n'arrive pas.
                    issue.checkLevel = "info";
                    issues.push(issue);
                    break;
                default:
                    issue.checkLevel = "warning";
                    issues.push(issue);
                    break;
            }
        }
        return issues;
    },
};
