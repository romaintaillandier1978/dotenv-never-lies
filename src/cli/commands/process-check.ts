// import dnl from "../../index.js";
// import { loadDef as loadDef } from "../utils/load-schema.js";
// import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { ProgramCliOptions } from "./program.js";

export type ProcessCheckCliOptions = ProgramCliOptions & {};
export type ProcessCheckResult = {
    warnings: string[];
};

export const processCheckCommand = async (opts?: ProcessCheckCliOptions | undefined): Promise<ProcessCheckResult> => {
    console.log("processCheckCommand", opts);
    // const schemaPath = resolveSchemaPath(opts?.schema);
    // const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<any>;
    return { warnings: [] };
};
