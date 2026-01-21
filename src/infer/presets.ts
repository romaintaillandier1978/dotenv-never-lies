import { InferPreset, PresetEntry } from "./presets.types.js";
import { officialPresetRegistry } from "./official-preset-registry.js";
import { nodePreset } from "./presets/node.js";
import { readUserPackageJson } from "../utils/read-user-package-json.js";
import { areAllSameGenSchemas } from "./helpers.js";




/** Search in package.json for present presets and help infer specific schema entries */
export const discoverPresets = (warnings: Array<string>): Array<InferPreset> => {

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

    const discovered: InferPreset[] = [
        nodePreset, // core preset, always enabled
    ];

    for (const depName of Object.keys(deps)) {
        const preset = officialPresetRegistry.get(depName);
        if (preset) {
            discovered.push(preset);
        }
    }
    if (discovered.length > 0) {
        warnings.push(`Discovered presets from package.json: ${discovered.map(p => p.origin).join(", ")}`);
    } else {
        warnings.push(`No known presets found in package.json`);
    }
    return discovered;
};



export const getPresetsFromNames = (names: Array<string> | undefined): Array<InferPreset> => {
    if (!names) {
        return [];
    }
    const presets: Array<InferPreset> = [];
    for (const name of names) {
        const preset = officialPresetRegistry.get(name);
        if (preset) {
            presets.push(preset);
        }
    }
    return presets;
};

export const findPresetEntry = (presets: Array<InferPreset> | undefined, name: string, warnings: Array<string>): [origin: string, entry: PresetEntry] | null => {
    if (!presets || presets.length === 0) {
        return null;
    }
    const results = Array<[origin: string, entry: PresetEntry]>();
    for (const preset of presets) {
        const entry = preset.presets[name];
        if (entry) {
            results.push([preset.origin, entry]);
        }
    }
    if (results.length === 0) {
        return null;
    }
    if (results.length === 1) {
        return results[0];
    }

    const areAllSame = areAllSameGenSchemas(results.map(r => r[1]));
    if (areAllSame) {
        // All presets are identical for this environment variable.
        // Let's do a gentle merge of the entries.
        // Concatenate descriptions.
        const description = Array.from(
            new Set(results.map(r => (r[1].description + " (" + r[0] + ")")))
        ).join(" - OR - ");
        // Concatenate origins, they are only used for display.
        const allOrigins = Array.from(new Set(results.map(r => r[0]))).join(", ");
        // Concatenate examples.
        const examples = results.flatMap(r => r[1].examples ?? []).filter((e): e is string => e !== undefined);
        // Collect all imports and merge them, though in theory they should all be the same.
        const imports = Array.from(new Map(
            results
                .flatMap(r => r[1].imports)
                .map(i => [`${i.name}|${i.from}`, i])
        ).values()
        );
        const gentleMergeEntry: PresetEntry = {
            description,
            schema: results[0][1].schema,
            secret: results[0][1].secret,
            examples: examples.length > 0 ? examples : undefined,
            kind: results[0][1].kind,
            code: results[0][1].code,
            imports: imports,
        }
        return [allOrigins, gentleMergeEntry];
    }

    warnings.push(`Preset conflict on ${name}: multiple incompatible definitions found (${results.map(r => r[0]).join(", ")}). Preset ignored.`);
    return null
};
