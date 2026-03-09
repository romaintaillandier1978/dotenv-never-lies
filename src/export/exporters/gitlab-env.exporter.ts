import type { EnvDefinition, EnvDefinitionHelper } from "../../index.js";
import type { ExportOptions } from "../export.types.js";
import { exportEnv } from "./env.exporter.js";

export const exportGitlabEnv = (
    envDef: EnvDefinitionHelper<EnvDefinition>,
    options: ExportOptions,
    warnings: string[]
): string => {
    return exportEnv(envDef, options, warnings);
};
