import { expect } from "vitest";
import type { HeuristicRule } from "../../heuristic.types.js";

export function expectNameInfluence(rule: HeuristicRule, value: string, nameWithHint: string, neutralName = "DUMMY") {
    const inputWithHint = { name: nameWithHint, rawValue: value };
    const inputNeutral = { name: neutralName, rawValue: value };

    const resultWithHint = rule.tryInfer(inputWithHint);
    const resultNeutral = rule.tryInfer(inputNeutral);

    expect(resultWithHint).not.toBeNull();
    expect(resultNeutral).not.toBeNull();

    expect(resultWithHint!.confidence).toBeGreaterThanOrEqual(rule.meta.threshold);
    expect(resultNeutral!.confidence).toBeGreaterThanOrEqual(rule.meta.threshold);

    const delta = resultWithHint!.confidence - resultNeutral!.confidence;
    expect(delta).toBeGreaterThan(0);
}
