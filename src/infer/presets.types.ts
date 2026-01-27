import { Simplify } from "type-fest";
import { EnvVarDefinition } from "../core.js";
import { GeneratedSchema, InferKind } from "./rules.types.js";
import { z } from "zod";

export type PresetEntry<T extends z.ZodType = z.ZodType, K extends InferKind = InferKind> = Simplify<EnvVarDefinition<T> & GeneratedSchema<K>>;

export type PressetDef = {
    origin: string;
    presets: Record<string, PresetEntry>;
};

export type PresetResult = {
    origin: Array<string>;
    // TODO, dans le report, trouver un moyen de ne pas sérialiser l'immonde shcéma zod.
    entry: PresetEntry;
    reasons: Array<string>;
    codeWarnings: Array<string>;
};
