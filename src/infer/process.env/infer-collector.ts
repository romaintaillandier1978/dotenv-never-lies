import { Project } from "ts-morph";

import { _ProcessEnvUsage } from "../../ast-tools/ast.types.js";
import { collectProcessEnvUsages } from "../../ast-tools/process-env-usage-collector.js";

/**
 * Collects all static process.env accesses that provide a fallback value, grouped by variable name.
 * @returns A map of process.env accesses by variable name.
 */
export const collectInferUsagesByName = (): Map<string, _ProcessEnvUsage<"static" | "destructured">[]> => {
    // Find all ts files in the user project:
    const project = new Project({
        tsConfigFilePath: "tsconfig.json",
    });
    const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");

    const accessesByVariableName: Map<string, _ProcessEnvUsage<"static" | "destructured">[]> = new Map();

    for (const sourceFile of sourceFiles) {
        const usages = collectProcessEnvUsages(sourceFile);

        for (const usage of usages) {
            if (usage.kind === "static" || usage.kind === "destructured") {
                const variableName = usage.varName;
                const list = accessesByVariableName.get(variableName) ?? [];
                list.push(usage);
                accessesByVariableName.set(variableName, list);
            }
        }
    }

    return accessesByVariableName;
};
