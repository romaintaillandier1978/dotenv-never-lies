import { secretVsNonStringRule } from "./cross-rules/secret-non-string.js";
import { CrossInferContext, CrossRule } from "./cross.types.js";
import { EvaluatedRule } from "./report.types.js";

export const CROSS_RULES: CrossRule[] = [secretVsNonStringRule];

export const crossEngine = (context: CrossInferContext): Array<EvaluatedRule<"cross">> => {
    const evaluatedRules: Array<EvaluatedRule<"cross">> = [];
    for (const rule of CROSS_RULES) {
        const crossResult = rule(context);
        if (!crossResult) continue;
        evaluatedRules.push({
            ruleMethod: "cross",
            outcome: "applied",
            result: crossResult,
        });
    }
    return evaluatedRules;
};
