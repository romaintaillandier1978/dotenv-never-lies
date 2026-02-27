import { Node, type Statement } from "ts-morph";
type EmptyObject = Record<never, never>;

export type ProcessEnvAccessKind =
    | "global" // process.env
    | "static" // process.env.X | process.env["X"]
    | "dynamic"; // process.env[key]

export type _ProcessEnvAccess<T extends ProcessEnvAccessKind> = {
    kind: T;
    node: Node;
    anchor: Statement;
    relativeFilePath: string;
    pos: { line: number; column: number };
} & (T extends "static" ? { varName: string; defaultValue?: string | undefined } : EmptyObject);

export type ProcessEnvAccess<T extends ProcessEnvAccessKind = ProcessEnvAccessKind> = { [key in ProcessEnvAccessKind]: _ProcessEnvAccess<key> }[T];
