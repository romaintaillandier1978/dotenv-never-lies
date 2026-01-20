import fs from "node:fs/promises";
import path from "node:path";
import { InferPreset, PresetEntry } from "./presets.types.js";
import { prisma } from "./presets/prisma.js";
import { typeorm } from "./presets/typeorm.js";
import { jsonwebtoken } from "./presets/jsonwebtoken.js";
import { something1, something2 } from "./presets/something.js";
import { vitestPreset } from "./presets/vitest.js";

/** search in package.json, find preset that are present, and help to infer specific entrey of the schema */
export const discoverPresets = async (warnings: Array<string>): Promise<Array<InferPreset>> => {

    const packageJsonPath = path.join(process.cwd(), "package.json");

    let pkg: any;
    try {
        const content = await fs.readFile(packageJsonPath, "utf-8");
        pkg = JSON.parse(content);
    } catch {
        // Pas de package.json → pas de preset
        return [];
    }

    const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.optionalDependencies,
    };

    if (!deps) {
        return [];
    }

    const discovered: InferPreset[] = [];

    for (const depName of Object.keys(deps)) {
        const preset = presetStore.get(depName);
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


const presetStore = new Map<string, InferPreset>();
presetStore.set("prisma", prisma);
presetStore.set("typeorm", typeorm);
presetStore.set("jsonwebtoken", jsonwebtoken);
presetStore.set("something1", something1);
presetStore.set("something2", something2);
presetStore.set("vitest", vitestPreset);
    
export const getPresetsFromNames = (names: Array<string>|undefined): Array<InferPreset> => {
    if(!names) {
        return [];
    }
    const presets: Array<InferPreset> = [];
    for(const name of names) {
        const preset = presetStore.get(name);
        if(preset) {
            presets.push(preset);
        }
    }
    return presets;
};

export const findPresetEntry = (presets: Array<InferPreset>|undefined, name: string, warnings: Array<string>): [origin:string,entry:PresetEntry] | null => {
    if(!presets || presets.length === 0) {
        return null;
    }
    const candidates = Array<PresetEntry>();
    const origins = Array<string>();
    for(const preset of presets) {
        const entry = preset.presets[name];
        const origin = preset.origin;
        if(entry) {
            candidates.push(entry);
            origins.push(origin);
        }
    }
    if(candidates.length === 0) {
        return null;
    }
    if(candidates.length === 1) {
        return [origins[0], candidates[0]];
    }
    warnings.push(
        `Preset conflict on ${name}: multiple definitions found (${origins.join(
          ", "
        )}). Preset ignored.`
      );
    
    return null;
};
