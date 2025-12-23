export class EnvFileNotFoundError extends Error {
    constructor(path: string) {
        super(`Env file not found: ${path}`);
        this.name = "EnvFileNotFoundError";
    }
}
