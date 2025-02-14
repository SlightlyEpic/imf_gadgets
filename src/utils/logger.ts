import { ILogger } from '@/types/logger';

export class ConsoleLogger implements ILogger {
    verbosity: number;

    constructor(verbosity: number) {
        this.verbosity = verbosity;
    }

    log(level: number, ...args: unknown[]) {
        if(level <= this.verbosity) console.log(new Date().toISOString(), ...args);
    }

    warn(level: number, ...args: unknown[]){
        if(level <= this.verbosity) console.warn(new Date().toISOString(), ...args);
    }

    error(level: number, ...args: unknown[]) {
        if(level <= this.verbosity) console.error(new Date().toISOString(), ...args);
    }

    setVerbosity(v: number) {
        this.verbosity = v;
    }
}
