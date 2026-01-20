import { z } from "zod";
import { InferPreset } from "../presets.types.js";

export const vitestPreset: InferPreset = {
  origin: "vitest",
  presets: {
    NODE_ENV: {
      description: "Node environment when running Vitest",
      schema: z.enum(["test"]),
      kind: "enum",
      code: 'z.enum(["test"])',
      imports: [],
    },
    VITEST: {
      description: "Defined when running under Vitest",
      schema: z.string(),
      kind: "string",
      code: "z.string()",
      imports: [],
    },
  },
};