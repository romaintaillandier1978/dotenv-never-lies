import path from "node:path";
import { InferReport } from "../../infer/report.types.js";
import fs from "node:fs";
import { cwd } from "node:process";
import { AnnotateReport } from "../../annotate/report.type.js";

export type DnlReport = InferReport | AnnotateReport;

export const saveReport = (report: DnlReport) => {
    const dir = path.resolve(cwd(), ".dnl");
    fs.mkdirSync(dir, { recursive: true });

    const reportPath = path.join(dir, `${report.type}.report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, replacer, 2), "utf8");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const replacer = function (this: any, key: string, value: any) {
    // Remove `schema` only in preset entries
    if (key === "schema" && this && typeof this === "object" && "description" in this && "kind" in this && "code" in this) {
        return undefined;
    }

    return value;
};

export type VerboseReportOptions = {
    showRejectedRules?: boolean;
};
const defaultVerboseReportOptions: VerboseReportOptions = {
    showRejectedRules: false,
};

export const verboseReport = (report: DnlReport, options?: VerboseReportOptions): string[] => {
    if (report.type === "infer") {
        return verboseInferReport(report as InferReport, options);
    } else if (report.type === "annotate") {
        return verboseAnnotateReport(report as AnnotateReport);
    }
    return [];
};

export const verboseInferReport = (report: InferReport, options?: VerboseReportOptions): string[] => {
    const opts = { ...defaultVerboseReportOptions, ...options };
    const verbose: string[] = [];
    verbose.push(`Infer report (verbose):`);
    verbose.push(`----------------------`);
    for (const envVar of report.envVars) {
        verbose.push(`\n${envVar.envVarName} : `);
        for (const rule of envVar.evaluatedRules) {
            if (rule.outcome === "accepted" || (opts.showRejectedRules && rule.outcome === "rejected") || rule.outcome === "applied") {
                if (rule.ruleMethod === "heuristic") {
                    verbose.push(
                        `  [${rule.ruleMethod} : ${rule.result.generated?.kind}] with confidence ${rule.result.confidence} / ${rule.meta.threshold} => ${rule.outcome.toUpperCase()}`
                    );
                } else if (rule.ruleMethod === "preset") {
                    verbose.push(`  [${rule.ruleMethod} : origin ${rule.result.origin.join(", ")}] => ${rule.outcome.toUpperCase()}`);
                } else if (rule.ruleMethod === "cross") {
                    verbose.push(`  [${rule.ruleMethod}] => ${rule.outcome.toUpperCase()}`);
                } else if (rule.ruleMethod === "secret") {
                    if (rule.result) {
                        verbose.push(`  [${rule.ruleMethod} : ${rule.result.isSecret ? "true" : "false"}] annotation ${rule.outcome}`);
                    }
                }
                // else {
                //     verbose.push(`  [${rule.ruleMethod}] => ${rule.outcome.toUpperCase()}`);
                // }
                for (const reason of rule.result.reasons) {
                    verbose.push(`    -> ${reason}`);
                }
            }
        }
        if (envVar.fallbacks) {
            for (const fallback of envVar.fallbacks) {
                verbose.push(`  -> FALLBACK : ${fallback.fallbackValue} in ${fallback.file}:${fallback.line}`);
            }
        }
        for (const warning of envVar.warnings) {
            verbose.push(`  -> WARNING : ${warning}`);
        }
    }
    verbose.push("\n");

    if (report.unknownVars && report.unknownVars.length > 0) {
        verbose.push(`----------------------`);
        verbose.push(`⚠️  UNKNOWN VARIABLES (${report.unknownVars.length}) :`);
        for (const unknownVar of report.unknownVars) {
            verbose.push(`  -> ${unknownVar.envVarName} (${unknownVar.occurences.map((o) => `${o.file}:${o.line}`).join(", ")})`);
        }
    }
    if (report.warnings.length > 0) {
        verbose.push(`----------------------`);
        verbose.push(`⚠️  WARNINGS (${report.warnings.length}) :`);
        for (const warning of report.warnings) {
            verbose.push(`  -> ${warning}`);
        }
        verbose.push(`----------------------`);
    }
    return verbose;
};

export const verboseAnnotateReport = (report: AnnotateReport): string[] => {
    const verbose: string[] = [];
    verbose.push(`Annotate report (verbose):`);
    verbose.push(`--------------------------`);

    const action = report.mode === "add" ? "added" : report.mode === "remove" ? "removed" : "checked";

    const issuesPerFile: Map<string, string[]> = new Map();
    for (const issue of report.issues) {
        const len = issue.nodeText.length;
        const checkLevel = issue.checkLevel ? `[${issue.checkLevel}]` : "";

        const issueText = `  - ${issue.nodeText} ${" ".repeat(Math.max(0, 40 - len))} => ${action} ${checkLevel} ${issue.annotation ?? ""}`;
        issuesPerFile.set(issue.filePath, [...(issuesPerFile.get(issue.filePath) || []), issueText]);
    }
    for (const [filePath, issues] of issuesPerFile) {
        verbose.push(`\n${filePath} : `);
        verbose.push(...issues);
    }

    const what = report.mode === "check" ? "accesses" : "annotations";

    verbose.push(`\nSummary: ${action} ${report.issues.length} ${what}`);
    if (report.summary.filesScanned) verbose.push(`  - ${report.summary.filesScanned} files scanned`);
    if (report.summary.accessesProcessed) verbose.push(`  - ${report.summary.accessesProcessed} process.env usages processed`);
    if (report.summary.commentsAdded) verbose.push(`  - ${report.summary.commentsAdded} comments added`);
    if (report.summary.commentsRemoved) verbose.push(`  - ${report.summary.commentsRemoved} comments removed`);
    if (report.summary.checkErrors) verbose.push(`  - ${report.summary.checkErrors} check errors`);
    if (report.summary.checkWarnings) verbose.push(`  - ${report.summary.checkWarnings} check warnings`);
    return verbose;
};

export const printWarnings = (report: DnlReport): string[] => {
    if (report.type === "annotate") {
        return printWarningsAnnotateReport(report as AnnotateReport);
    }
    return [];
};

export const printWarningsAnnotateReport = (report: AnnotateReport): string[] => {
    if (report.mode !== "check" || report.summary.checkWarnings === 0) return [];
    const verbose: string[] = [];
    verbose.push(`Warnings report :`);
    verbose.push(`----------------------`);

    commonPrintAnnotateIssues(report, verbose);
    return verbose;
};

export const printErrors = (report: DnlReport): string[] => {
    if (report.type === "annotate") {
        return printErrorsAnnotateReport(report as AnnotateReport);
    }
    return [];
};

export const printErrorsAnnotateReport = (report: AnnotateReport): string[] => {
    if (report.mode !== "check") return [];
    const verbose: string[] = [];
    verbose.push(`Errors report :`);
    verbose.push(`----------------------`);
    commonPrintAnnotateIssues(report, verbose);
    return verbose;
};

const commonPrintAnnotateIssues = (report: AnnotateReport, verbose: string[]): void => {
    const issuesPerFile: Map<string, string[]> = new Map();
    for (const issue of report.issues) {
        const len = issue.nodeText.length;
        const checkLevel = issue.checkLevel ? `[${issue.checkLevel}]` : "";
        if (checkLevel === "info") continue;

        const issueText = `  - ${issue.nodeText} ${" ".repeat(Math.max(0, 40 - len))} =>  ${checkLevel} ${issue.annotation ?? ""}`;
        issuesPerFile.set(issue.filePath, [...(issuesPerFile.get(issue.filePath) || []), issueText]);
    }
    for (const [filePath, issues] of issuesPerFile) {
        verbose.push(`\n${filePath} : `);
        verbose.push(...issues);
    }

    verbose.push(`\nSummary: ${report.issues.length} "accesses"`);
    if (report.summary.filesScanned) verbose.push(`  - ${report.summary.filesScanned} files scanned`);
    if (report.summary.accessesProcessed) verbose.push(`  - ${report.summary.accessesProcessed} process.env usages processed`);
    if (report.summary.checkErrors) verbose.push(`  - ${report.summary.checkErrors} check errors`);
    if (report.summary.checkWarnings) verbose.push(`  - ${report.summary.checkWarnings} check warnings`);
};
