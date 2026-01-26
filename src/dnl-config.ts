import { z } from "zod";
import type { PackageJson, Simplify } from "type-fest";

export const dnlConfigSchema = z
    .object({
        schema: z.string(),
    })
    .strict();

export type DnlConfig = z.infer<typeof dnlConfigSchema>;

export type PackageJsonWithDnl = Simplify<
    PackageJson & {
        "dotenv-never-lies"?: DnlConfig;
    }
>;
