import { InferContext } from "./infer.types.js";
import { EvaluatedRule } from "./report.types.js";
import { booleanRule } from "./rules/boolean.js";
import { durationRule } from "./rules/duration.js";
import { jsonRule } from "./rules/json.js";
import { listRule } from "./rules/list.js";
import { portRule } from "./rules/port.js";
import { emailRule, fallbackEvaluatedRule, numberRule, stringRule } from "./rules/basic.js";
import { urlRule } from "./rules/url.js";
import { ipRule } from "./rules/ip.js";
import { versionRule } from "./rules/version.js";
import { keyValueRule } from "./rules/key-value.js";
import { ReadonlyDeep } from "type-fest";
import { HeuristicRule } from "./heuristic.types.js";

// ⚠️ Règle d’or :
// JSON avant list,
// port avant number
// duration avant number,

const HEURISTIC_RULES: ReadonlyDeep<HeuristicRule[]> = [
    jsonRule, // 10
    listRule, // 7
    portRule, //7
    durationRule, // 6
    booleanRule, // 6
    ipRule, // 5.5
    versionRule, // 5
    urlRule, // 5
    emailRule, // 4
    keyValueRule, // 3.5
    numberRule, // 3

    stringRule, // 0 = fallback
].sort((a, b) => b.meta.priority - a.meta.priority);

export const heuristicEngine = (context: InferContext): Array<EvaluatedRule<"heuristic">> => {
    const evaluatedRules: Array<EvaluatedRule<"heuristic">> = [];
    // for each rules,
    for (const rule of HEURISTIC_RULES) {
        // try to infer a schema for the current context
        const heuristicResult = rule.tryInfer({ name: context.name, rawValue: context.rawValue });

        if (!heuristicResult) continue;

        const outcome = heuristicResult.confidence >= rule.meta.threshold ? "accepted" : "rejected";

        const ruleReport: EvaluatedRule<"heuristic"> = {
            ruleMethod: "heuristic",
            meta: rule.meta,
            result: heuristicResult,
            outcome,
        };
        evaluatedRules.push(ruleReport);

        if (outcome === "accepted") {
            context.imports.push(...heuristicResult.generated.imports);

            if (heuristicResult.codeWarnings) {
                context.codeWarnings.push(...heuristicResult.codeWarnings);
            }
            return evaluatedRules;
        }
    }

    // here, no rule was applyable, so we fallback to string
    evaluatedRules.push(fallbackEvaluatedRule);
    return evaluatedRules;
};
