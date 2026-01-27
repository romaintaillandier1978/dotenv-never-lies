import { CROSS_RULES, RULES } from "../../infer/rules.js";
import { CrossInferContext, InferContext } from "../../infer/rules.types.js";
import { EvaluatedRule, fallbackEvaluatedRule } from "../../infer/report.types.js";

export const infer = (context: InferContext): Array<EvaluatedRule<"heuristic">> => {
    const evaluatedRules: Array<EvaluatedRule<"heuristic">> = [];
    // for each rules,
    for (const rule of RULES) {
        // try to infer a schema for the current context
        const inferResult = rule.tryInfer({ name: context.name, rawValue: context.rawValue });

        if (!inferResult) continue;

        const outcome = inferResult.confidence >= rule.meta.threshold ? "accepted" : "rejected";

        const ruleReport: EvaluatedRule<"heuristic"> = {
            ruleMethod: "heuristic",
            meta: rule.meta,
            inferResult: inferResult,
            outcome,
        };
        evaluatedRules.push(ruleReport);

        if (outcome === "accepted") {
            context.imports.push(...inferResult.generated.imports);

            if (inferResult.codeWarnings) {
                context.codeWarnings.push(...inferResult.codeWarnings);
            }
            return evaluatedRules;
        }
    }

    // here, no rule was applyable, so we fallback to string
    evaluatedRules.push(fallbackEvaluatedRule);
    return evaluatedRules;
};

export const crossInfer = (context: CrossInferContext): void => {
    for (const rule of CROSS_RULES) {
        rule(context);
    }
};
