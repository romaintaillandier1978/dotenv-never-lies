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

export function expectResilienceSurroundinSpaces(rule: HeuristicRule, value: string, name: string) {
    const spacedValues = [
        ` ${value} `,
        `${value} `,
        ` ${value}`,
        `    ${value}   `,
        ` \t${value} \t`,
        `\n${value}\n`,
        `\r${value}\r`,
        `\n\t${value}\n\t`,
        `\r\t${value}\r\t`,
    ];
    for (const sp of spacedValues) {
        const result = rule.tryInfer({ name, rawValue: sp });
        expect(result).not.toBeNull();
        expect(result!.confidence).toBeGreaterThanOrEqual(rule.meta.threshold);
    }
}

export function expectValidToHaveGoodReasons(rule: HeuristicRule, validValues: string[], name: string) {
    for (const validValue of validValues) {
        const result = rule.tryInfer({ name, rawValue: validValue });
        expect(result).not.toBeNull();
        expect(result!.reasons).toBeDefined();
        expect(result!.reasons.length).toBeGreaterThan(0);

        const reasonScoreRegex = /\([-+](\d+)\)/;
        for (const reason of result!.reasons) {
            const match = reason.match(reasonScoreRegex);
            const reasonScore = match ? Number(match[1]) : null;
            expect(reasonScore).toBeDefined();
            expect(reasonScore).toBeGreaterThan(0);
        }
    }
}
