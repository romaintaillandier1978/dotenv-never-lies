import { Simplify } from "type-fest";
import { HeuristicResult, HeuristicRuleMeta } from "./heuristic.types.js";
import { fallbackInferResult, stringRule } from "./rules/basic.js";
import { PresetResult } from "./presets.types.js";
import { SecretResult } from "./secret.types.js";
import { CrossResult } from "./cross.types.js";

export type RuleOutcome = "accepted" | "rejected" | "applied";
export type RuleMethod = "preset" | "heuristic" | "secret" | "cross";
// export type EvaluatedRule<T extends RuleType> ;

export type EvaluatedRuleTable = {
    preset: {
        result: PresetResult;
    };
    heuristic: {
        meta: HeuristicRuleMeta;
        result: HeuristicResult;
    };
    secret: {
        result: SecretResult;
    };
    cross: {
        result: CrossResult;
    };
};

export type EvaluatedRule<T extends RuleMethod> = Simplify<EvaluatedRuleTable[T] & { ruleMethod: T; outcome: RuleOutcome }>;

export type RuleType<T extends RuleMethod> = EvaluatedRule<T>["ruleMethod"];

export const fallbackEvaluatedRule: EvaluatedRule<"heuristic"> = {
    ruleMethod: "heuristic",
    meta: { ...stringRule.meta },
    result: fallbackInferResult,
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
    warnings: Array<string>;
};
