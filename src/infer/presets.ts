import { InferPreset, PresetEntry } from "./presets.types.js";
import { officialPresetRegistry } from "./official-preset-registry.js";
import { nodePreset } from "./presets/node.js";
import { readUserPackageJson } from "../utils/read-user-package-json.js";




/** search in package.json, find preset that are present, and help to infer specific entrey of the schema */
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
    const candidates = Array<PresetEntry>();
    const origins = Array<string>();
    for (const preset of presets) {
        const entry = preset.presets[name];
        const origin = preset.origin;
        if (entry) {
            candidates.push(entry);
            origins.push(origin);
        }
    }
    if (candidates.length === 0) {
        return null;
    }
    if (candidates.length === 1) {
        return [origins[0], candidates[0]];
    }
    warnings.push(
        `Preset conflict on ${name}: multiple definitions found (${origins.join(
            ", "
        )}). Preset ignored.`
    );

    return null;
};
