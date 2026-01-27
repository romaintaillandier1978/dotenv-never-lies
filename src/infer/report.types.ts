import { Simplify } from "type-fest";
import { GeneratedSchema } from "./infer.types.js";
import { HeuristicResult, HeuristicRuleMeta } from "./heuristic.types.js";
import { fallbackInferResult, stringRule } from "./rules/basic.js";
import { PresetResult } from "./presets.types.js";

export type RuleOutcome = "accepted" | "rejected";
export type RuleMethod = "preset" | "heuristic" | "isSecret" | "cross";
// export type EvaluatedRule<T extends RuleType> ;

export type EvaluatedRuleTable = {
    preset: {
        presetResult: PresetResult;
    };
    heuristic: {
        meta: HeuristicRuleMeta;
        inferResult: HeuristicResult;
    };
    isSecret: {
        secret: boolean;
    };
    cross: {
        crossResult: { generated: GeneratedSchema };
    };
};

export type EvaluatedRule<T extends RuleMethod> = Simplify<EvaluatedRuleTable[T] & { ruleMethod: T; outcome: RuleOutcome }>;

export type RuleType<T extends RuleMethod> = EvaluatedRule<T>["ruleMethod"];

export const fallbackEvaluatedRule: EvaluatedRule<"heuristic"> = {
    ruleMethod: "heuristic",
    meta: { ...stringRule.meta },
    inferResult: fallbackInferResult,
    outcome: "accepted",
};

export type InferReportEntry = {
    envVarName: string;
    evaluatedRules: Array<EvaluatedRule<RuleMethod>>;
    warnings: Array<string>;
};

export type InferReport = {
    inputs: {
        source: string;
        presets: Array<string>;
        discoverPresets: boolean;
    };
    envVars: Array<InferReportEntry>;
};
