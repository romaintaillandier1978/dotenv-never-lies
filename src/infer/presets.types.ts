import {  EnvVarDefinition } from "../core.js";
import { GeneratedSchema, InferKind } from "./rules.types.js";
import { z } from "zod";

export type PresetEntry  < T extends z.ZodType = z.ZodType, K extends InferKind = InferKind> = EnvVarDefinition<T> & GeneratedSchema<K>


export type InferPreset = {
    origin: string;
    presets: Record<string, PresetEntry>;
};