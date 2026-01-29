import path from "node:path";
import { EvaluatedRule, InferReport } from "../../infer/report.types.js";
import fs from "node:fs";
import { cwd } from "node:process";

export const saveReport = (report: InferReport) => {
    const dir = path.resolve(cwd(), ".dnl");
    fs.mkdirSync(dir, { recursive: true });

    const reportPath = path.join(dir, "infer.report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, replacer, 2), "utf8");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const replacer = function (this: any, key: string, value: any) {
    // On supprime `schema` uniquement dans les entries de preset
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

export const verboseReport = (report: InferReport, options?: VerboseReportOptions): string[] => {
    const opts = { ...defaultVerboseReportOptions, ...options };
    const verbose: string[] = [];
    verbose.push(`Infer report (verbose):`);
    verbose.push(`----------------------`);
    for (const envVar of report.envVars) {
        verbose.push(`\n${envVar.envVarName} : `);
        for (const rule of envVar.evaluatedRules) {
            if (rule.outcome === "accepted" || (opts.showRejectedRules && rule.outcome === "rejected") || rule.outcome === "applied") {
                if (rule.ruleMethod === "heuristic") {
                    const heuristicRule = rule as EvaluatedRule<"heuristic">;
                    verbose.push(
                        `  [${rule.ruleMethod} : ${heuristicRule.result.generated?.kind}] with confidence ${heuristicRule.result.confidence} / ${heuristicRule.meta.threshold} => ${rule.outcome.toUpperCase()}`
                    );
                } else if (rule.ruleMethod === "preset") {
                    const presetRule = rule as EvaluatedRule<"preset">;
                    verbose.push(`  [${rule.ruleMethod} : origin ${presetRule.result.origin.join(", ")}] => ${rule.outcome.toUpperCase()}`);
                } else if (rule.ruleMethod === "cross") {
                    verbose.push(`  [${rule.ruleMethod}] => ${rule.outcome.toUpperCase()}`);
                } else if (rule.ruleMethod === "secret") {
                    const secretRule = rule as EvaluatedRule<"secret">;
                    if (secretRule.result) {
                        verbose.push(`  [${rule.ruleMethod} : ${secretRule.result.isSecret ? "true" : "false"}] annotation ${rule.outcome}`);
                    }
                } else {
                    verbose.push(`  [${rule.ruleMethod}] => ${rule.outcome.toUpperCase()}`);
                }
                for (const reason of rule.result.reasons) {
                    verbose.push(`    -> ${reason}`);
                }
            }
        }
        for (const warning of envVar.warnings) {
            verbose.push(`  -> WARNING : ${warning}`);
        }
    }
    if (report.warnings.length > 0) {
        verbose.push(`\n----------------------`);
        verbose.push(`⚠️  WARNINGS (${report.warnings.length}) :`);
        for (const warning of report.warnings) {
            verbose.push(`  -> ${warning}`);
        }
        verbose.push(`----------------------`);
    }
    return verbose;
};
