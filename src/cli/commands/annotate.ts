import dnl from "../../index.js";
import { ProgramCliOptions } from "./program.js";
import { collectProcessEnvUsages } from "../../annotate/annotate-collector.js";
import { annotateEngine } from "../../annotate/annotate-engine.js";
import { Project } from "ts-morph";
import { AnnotateMode, AnnotateReport, type AnnotateIssue } from "../../annotate/report.type.js";
import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { EnvDefinition } from "../../index.js";
import { UsageError } from "../../errors.js";
import { saveReport } from "../utils/report.js";
import { groupProcessEnvUsagesByStatementMap } from "../../ast-tools/ast-helpers.js";

export type AnnotateCliOptions = ProgramCliOptions & {
    remove?: boolean;
    check?: boolean;
    warnAsError?: boolean;
    silentWarn?: boolean;
    verbose?: boolean;
};

const defaultAnnotateOptions: AnnotateCliOptions = {
    remove: false,
    check: false,
    warnAsError: false,
    verbose: false,
};

export const annotateCommand = async (_opts: AnnotateCliOptions): Promise<AnnotateReport> => {
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
        type: "annotate",
        mode,
        issues: [],
        summary: {
            filesScanned: 0,
            accessesProcessed: 0,
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
        const accesses = collectProcessEnvUsages(sourceFile);

        if (accesses.length < 1) {
            continue;
        }

        // Group by statement: a statement may contain multiple process.env accesses
        // (e.g. process.env.A ?? process.env["B"]). We process all accesses of the statement together
        // to produce a single issue and a comment with all @see.
        const accessesByStatement = groupProcessEnvUsagesByStatementMap(accesses);
        const before = sourceFile.getFullText();
        for (const statementAccesses of accessesByStatement.values()) {
            await annotateEngine(statementAccesses, {
                mode,
                warnAsError: opts.warnAsError ?? false,
                project,
                sourceFile,
                schemaPath,
                envDef,
                report,
            });
        }
        // In remove mode:
        // we are no longer working with the AST which does not contain comments.
        // we are working with text and therefore the offsets shift as we delete.
        // we need to start from the end!
        if (mode === "remove") {
            // Here we remove the text.
            const filePath = sourceFile.getFilePath();
            const withRemoval = report.issues.filter(
                (issue): issue is AnnotateIssue & { removalRange: { start: number; end: number } } =>
                    filePath.endsWith(issue.filePath) && issue.removalRange != null
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

    saveReport(report);
    return report;
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
