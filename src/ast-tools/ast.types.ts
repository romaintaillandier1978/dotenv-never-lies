import { Node, type Statement } from "ts-morph";
type EmptyObject = Record<never, never>;

export type ProcessEnvUsageKind =
    | "global" // process.env
    | "static" // process.env.X | process.env["X"]
    | "dynamic" // process.env[key]
    | "destructured"; // const { X = "default", Y } = process.env;

export type _ProcessEnvUsage<T extends ProcessEnvUsageKind> = {
    kind: T;
    node: Node;
    anchor: Statement;
    relativeFilePath: string;
    pos: { line: number; column: number };
} & (T extends "static" | "destructured" ? { varName: string } : EmptyObject) &
    (T extends "static" | "destructured" | "dynamic" ? { fallbackLiteral?: string | undefined } : EmptyObject);

export type ProcessEnvUsages<T extends ProcessEnvUsageKind = ProcessEnvUsageKind> = { [key in ProcessEnvUsageKind]: _ProcessEnvUsage<key> }[T];
