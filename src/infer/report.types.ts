import { HeuristicResult, HeuristicRuleMeta } from "./heuristic.types.js";
import { PresetResult } from "./presets.types.js";
import { SecretResult } from "./secret.types.js";
import { CrossResult } from "./cross.types.js";

type EmptyObject = Record<never, never>;

export type RuleOutcome = "accepted" | "rejected" | "applied";
export type RuleMethod = "preset" | "heuristic" | "secret" | "cross";

type RuleResultTable = { preset: PresetResult; heuristic: HeuristicResult; secret: SecretResult; cross: CrossResult };

export type RuleResult<T extends RuleMethod> = RuleResultTable[T];

type _EvaluatedRule<T extends RuleMethod> = {
    ruleMethod: T;
    outcome: RuleOutcome;
    result: RuleResult<T>;
} & (T extends "heuristic" ? { meta: HeuristicRuleMeta } : EmptyObject);

export type EvaluatedRule<T extends RuleMethod> = { [key in RuleMethod]: _EvaluatedRule<key> }[T];

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
