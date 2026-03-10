import { ExportCliOptions } from "../cli/commands/export.js";
import { EnvDefinitionHelper } from "../core.js";
import { EnvDefinition } from "../core.js";

export interface DnlExporter {
    name: string;
    description?: string;
    run(envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportCliOptions, warnings: string[]): string;
}

const exporters = new Map<string, DnlExporter>();

export function registerExporter(exp: DnlExporter) {
    exporters.set(exp.name, exp);
}

export function getExporter(name: string): DnlExporter | undefined {
    return exporters.get(name);
}

export function listExporters(): string[] {
    return [...exporters.keys()];
}
