// import dnl from "../../index.js";
// import { loadDef as loadDef } from "../utils/load-schema.js";
// import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { ProgramCliOptions } from "./program.js";

import { collectProcessEnvNodes } from "../../process/process-collector.js";
import { processNodeEngine } from "../../process/process-engine.js";
import { Project } from "ts-morph";
import { groupNodesByStatement } from "../../process/process-collector.js";
import { ProcessReport } from "../../process/report.type.js";

export type ProcessFixCliOptions = ProgramCliOptions & {
    fixMode: boolean;
    dryRun: boolean;
};
export type ProcessFixResult = {
    warnings: string[];
};
const defaultProcessFixOptions: ProcessFixCliOptions = {
    fixMode: true,
    dryRun: false,
};

export const processFixCommand = async (_opts?: ProcessFixCliOptions | undefined): Promise<ProcessFixResult> => {
    const opts = { ...defaultProcessFixOptions, ..._opts };

    const isFixMode = opts?.fixMode ?? false;
    const dryRun = opts?.dryRun ?? false;
    console.log("isFixMode : ", isFixMode);
    console.log("dryRun : ", dryRun);
    console.log("will save : ", isFixMode && !dryRun);

    const report: ProcessReport = {
        mode: !isFixMode ? "check" : dryRun ? "fix-dry-run" : "fix",
        issues: [],
        summary: {
            filesScanned: 0,
            nodesProcessed: 0,
            errors: 0,
            warnings: 0,
            fixesApplied: 0,
            commentsAdded: 0,
        },
    };
    // const schemaPath = resolveSchemaPath(opts?.schema);
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    // const env = envDef.assert();

    // REchercher tous les fichiers ts du projet utilisateur :
    const project = new Project({
        tsConfigFilePath: "tsconfig.json",
    });
    const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");
    for (const sourceFile of sourceFiles) {
        report.summary.filesScanned++;
        const nodes = collectProcessEnvNodes(sourceFile);

        if (nodes.length > 0) {
            console.log("nodes found : ", nodes.length);
        }

        // Grouper par statement : un même statement peut contenir plusieurs process.env
        // (ex: process.env.A ?? process.env.B). Modifier le statement invalide tous les
        // nodes enfants, il faut donc ne traiter qu'un node par statement.
        const nodePerStatement = groupNodesByStatement(nodes);

        for (const node of nodePerStatement) {
            await processNodeEngine(node, {
                sourceFile,
                isFixMode,
                dryRun,
                report,
            });
        }
        if (isFixMode && !dryRun) {
            await sourceFile.save();
            console.log("saved file : ", sourceFile.getFilePath());
        }
    }

    console.log("report : ", report);
    return { warnings: [] };
};
