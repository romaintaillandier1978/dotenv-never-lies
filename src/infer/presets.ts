import { PressetDef, PresetEntry } from "./presets.types.js";
import { officialPresetRegistry } from "./official-preset-registry.js";
import { nodePreset } from "./presets/node.js";
import { readUserPackageJson } from "../utils/read-user-package-json.js";
import { areAllSameGenSchemas } from "./helpers.js";
import { EvaluatedRule } from "./report.types.js";

/** Search in package.json for present presets and help infer specific schema entries */
export const discoverPresets = (warnings: Array<string>): Array<PressetDef> => {
    const pkg = readUserPackageJson();
    if (!pkg) return [];

    const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.optionalDependencies,
    };

    if (!deps) {
        return [];
    }

    const discovered: PressetDef[] = [
        nodePreset, // core preset, always enabled
    ];

    for (const depName of Object.keys(deps)) {
        const preset = officialPresetRegistry.get(depName);
        if (preset) {
            discovered.push(preset);
        }
    }
    if (discovered.length > 0) {
        warnings.push(`Discovered presets from package.json: ${discovered.map((p) => p.origin).join(", ")}`);
    } else {
        warnings.push(`No known presets found in package.json`);
    }
    return discovered;
};

export const getPresetsFromNames = (names: Array<string> | undefined): Array<PressetDef> => {
    if (!names) {
        return [];
    }
    const presets: Array<PressetDef> = [];
    for (const name of names) {
        const preset = officialPresetRegistry.get(name);
        if (preset) {
            presets.push(preset);
        }
    }
    return presets;
};

export const findPresetEntry = (presets: Array<PressetDef> | undefined, name: string): Array<EvaluatedRule<"preset">> | null => {
    if (!presets || presets.length === 0) {
        return null;
    }

    const results: Array<[origin: string, entry: PresetEntry]> = [];

    for (const preset of presets) {
        const entry = preset.presets[name];
        if (entry) {
            results.push([preset.origin, entry]);
        }
    }
    if (results.length === 0) {
        return null;
    }
    const evaluatedRules: Array<EvaluatedRule<"preset">> = [];
    if (results.length === 1) {
        const [origin, entry] = results[0];
        evaluatedRules.push({
            ruleMethod: "preset",
            result: { origin: [origin], entry, reasons: [], codeWarnings: [] },
            outcome: "accepted",
        });
        return evaluatedRules;
    }

    const areAllSame = areAllSameGenSchemas(results.map((r) => r[1]));
    if (areAllSame) {
        // All presets are identical for this environment variable.
        // Let's do a gentle merge of the entries.
        // Concatenate descriptions.
        const description = Array.from(new Set(results.map((r) => r[1].description + " (" + r[0] + ")"))).join(" - OR - ");
        // Concatenate origins, they are only used for display.
        const allOrigins = Array.from(new Set(results.map((r) => r[0])));
        // Concatenate examples.
        const examples = results.flatMap((r) => r[1].examples ?? []).filter((e): e is string => e !== undefined);
        // Collect all imports and merge them, though in theory they should all be the same.
        const imports = Array.from(new Map(results.flatMap((r) => r[1].imports).map((i) => [`${i.name}|${i.from}`, i])).values());
        const gentleMergeEntry: PresetEntry = {
            description,
            schema: results[0][1].schema,
            secret: results[0][1].secret,
            examples: examples.length > 0 ? examples : undefined,
            kind: results[0][1].kind,
            code: results[0][1].code,
            imports: imports,
        };
        evaluatedRules.push({
            ruleMethod: "preset",
            result: {
                origin: [...allOrigins],
                entry: gentleMergeEntry,
                reasons: ["Preset conflict, compatible definitions merged"],
                codeWarnings: [],
            },
            outcome: "accepted",
        });
        return evaluatedRules;
    }

    // Else, we have multiple incompatible definitions. (!areAllSame)
    for (const [origin, entry] of results) {
        evaluatedRules.push({
            ruleMethod: "preset",
            result: {
                origin: [origin],
                entry,
                reasons: ["Preset conflict, multiple incompatible definitions found."],
                codeWarnings: [],
            },
            outcome: "rejected",
        });
    }
    return evaluatedRules;
};
