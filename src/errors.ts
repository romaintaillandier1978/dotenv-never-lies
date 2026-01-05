export enum ExitCodes {
    success = 0,
    usageError = 1,
    schemaNotFound = 2,
    validationError = 3,
    exportError = 4,
}

export class DnlError extends Error {
    constructor(
        message: string,
        public readonly exitCode: ExitCodes
    ) {
        super(message);
    }
}
export class UsageError extends DnlError {
    constructor(message: string) {
        super(message, ExitCodes.usageError);
    }
}
export class SchemaNotFoundError extends DnlError {
    constructor(message: string) {
        super(message, ExitCodes.schemaNotFound);
    }
}

export class ValidationError extends DnlError {
    constructor(
        message: string,
        public readonly issues?: {
            key: string;
            message: string;
        }[]
    ) {
        super(message, ExitCodes.validationError);
    }
}

export class ExportError extends DnlError {
    constructor(message: string) {
        super(message, ExitCodes.exportError);
    }
}
