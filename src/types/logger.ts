export interface ILogger {
    verbosity: number;

    log(level: number, ...args: unknown[]): unknown | Promise<unknown>;
    warn(level: number, ...args: unknown[]): unknown | Promise<unknown>;
    error(level: number, ...args: unknown[]): unknown | Promise<unknown>;

    setVerbosity(v: number): void;
}
