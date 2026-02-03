import dnl from "../../index.js";
// import { loadDef as loadDef } from "../utils/load-schema.js";
// import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { ProgramCliOptions } from "./program.js";

import { collectProcessEnvNodes } from "../../annotate/annotate-collector.js";
import { annotateEngine } from "../../annotate/annotate-engine.js";
import { Project } from "ts-morph";
import { groupNodesByStatement } from "../../annotate/annotate-collector.js";
import { AnnotateReport } from "../../annotate/report.type.js";
import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { EnvDefinition } from "../../index.js";

export type AnnotateCliOptions = ProgramCliOptions;
export type AnnotateResult = {
    warnings: string[];
};

export const annotateCommand = async (_opts?: AnnotateCliOptions | undefined): Promise<AnnotateResult> => {
    const opts = _opts ?? {};

    const schemaPath = resolveSchemaPath(opts?.schema);
    const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<EnvDefinition>;

    const report: AnnotateReport = {
        issues: [],
        summary: {
            filesScanned: 0,
            nodesProcessed: 0,
            commentsAdded: 0,
        },
    };

    // Find all ts files in the user project:
    const project = new Project({
        tsConfigFilePath: "tsconfig.json",
    });
    const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");

    for (const sourceFile of sourceFiles) {
        report.summary.filesScanned++;
        const nodes = collectProcessEnvNodes(sourceFile);

        if (nodes.length < 1) {
            continue;
        }

        // Group by statement: a single statement may contain multiple process.env
        // (e.g. process.env.A ?? process.env.B). Modifying the statement invalidates all
        // child nodes, so we must only process one node per statement.
        const nodePerStatement = groupNodesByStatement(nodes);
        // file content before annotation
        const before = sourceFile.getFullText();
        // annotate the file
        for (const node of nodePerStatement) {
            await annotateEngine(node, {
                project,
                sourceFile,

                schemaPath,
                envDef,
                report,
            });
        }
        // file content after annotation
        const after = sourceFile.getFullText();
        // if the file was modified, save it
        if (before !== after) {
            await sourceFile.save();
        }
    }

    console.log("report : ", report);
    // TODO : save the report.
    // TODO : verbose
    return { warnings: [] };
};
