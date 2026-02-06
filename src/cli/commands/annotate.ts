import dnl from "../../index.js";
import { ProgramCliOptions } from "./program.js";
import { collectProcessEnvNodes, groupNodesByStatementMap } from "../../annotate/annotate-collector.js";
import { annotateEngine } from "../../annotate/annotate-engine.js";
import { Project } from "ts-morph";
import { AnnotateMode, AnnotateReport, type AnnotateIssue } from "../../annotate/report.type.js";
import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { EnvDefinition } from "../../index.js";
import { UsageError } from "../../errors.js";

export type AnnotateCliOptions = ProgramCliOptions & {
    remove?: boolean;
    check?: boolean;
    warnAsError?: boolean;
    verbose?: boolean;
};

export type AnnotateResult = {
    warnings: string[];
};

const defaultAnnotateOptions: AnnotateCliOptions = {
    remove: false,
    check: false,
    warnAsError: false,
    verbose: false,
};

export const annotateCommand = async (_opts: AnnotateCliOptions): Promise<AnnotateResult> => {
    if (_opts.check && _opts.remove) {
        throw new UsageError("--check and --remove options cannot be used together");
    }
    if (!_opts.check && _opts.warnAsError) {
        throw new UsageError("--warn-as-error can only be used with --check");
    }
    const mode: AnnotateMode = _opts.check ? "check" : _opts.remove ? "remove" : "add";
    const opts = { ...defaultAnnotateOptions, ..._opts };

    const schemaPath = resolveSchemaPath(opts?.schema);
    const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<EnvDefinition>;
    const report: AnnotateReport = {
        mode,
        issues: [],
        summary: {
            filesScanned: 0,
            nodesProcessed: 0,
            commentsAdded: 0,
            commentsRemoved: 0,
            checkErrors: 0,
            checkWarnings: 0,
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

        // Grouper par statement : un statement peut contenir plusieurs process.env
        // (ex. process.env.A ?? process.env["B"]). On traite tous les nodes du statement ensemble
        // pour produire une seule issue et un commentaire avec tous les @see.
        const nodesByStatement = groupNodesByStatementMap(nodes);
        const before = sourceFile.getFullText();
        for (const statementNodes of nodesByStatement.values()) {
            await annotateEngine(statementNodes, {
                mode,
                warnAsError: opts.warnAsError ?? false,
                project,
                sourceFile,
                schemaPath,
                envDef,
                report,
            });
        }
        // in remove mode  :
        // we are no longer working with the AST which does not contain comments.
        // we are working with text and therefore the offsets shift as we delete.
        // we need to start from the end!
        if (mode === "remove") {
            const filePath = sourceFile.getFilePath();
            const withRemoval = report.issues.filter(
                (issue): issue is AnnotateIssue & { removalRange: { start: number; end: number } } => issue.filePath === filePath && issue.removalRange != null
            );
            const sorted = [...withRemoval].sort((a, b) => b.removalRange.start - a.removalRange.start);
            for (const issue of sorted) {
                sourceFile.replaceText([issue.removalRange.start, issue.removalRange.end], "");
            }
        }
        // file content after annotation
        const after = sourceFile.getFullText();
        // if the file was modified, save it
        if (before !== after) {
            await sourceFile.save();
        }
    }

    console.log("report : ", JSON.stringify(report, null, 2));
    // TODO : save the report.
    // TODO : verbose
    return { warnings: [] };
};

export type AnnotateCheckCliOptions = ProgramCliOptions & {
    warn?: boolean;
    warnAsError?: boolean;
};

// const defaultAnnotateCheckOptions: AnnotateCheckCliOptions = {
//     warn: true,
//     warnAsError: false,
// };

// export const annotateCheckCommand = async (_opts: AnnotateCheckCliOptions): Promise<AnnotateResult> => {
//     const opts = { ...defaultAnnotateCheckOptions, ..._opts };

//     // Find all ts files in the user project:
//     const project = new Project({
//         tsConfigFilePath: "tsconfig.json",
//     });
//     const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");

//     for (const sourceFile of sourceFiles) {
//         report.summary.filesScanned++;
//         const nodes = collectProcessEnvNodes(sourceFile);

//         if (nodes.length < 1) {
//             continue;
//         }

//         // Group by statement: a single statement may contain multiple process.env
//         // (e.g. process.env.A ?? process.env.B). Modifying the statement invalidates all
//         // child nodes, so we must only process one node per statement.
//         const nodePerStatement = groupNodesByStatement(nodes);
//         // file content before annotation
//         const before = sourceFile.getFullText();
//         // annotate the file
//         for (const node of nodePerStatement) {
//             await annotateEngine(node, opts.remove ?? false, {
//                 project,
//                 sourceFile,
//                 schemaPath,
//                 envDef,
//                 report,
//             });
//         }
//     }

//     return { warnings: [] };
// };
