import { type Env, envSchema } from '@/types/env';

export function readEnv(): Env {
    const maybeEnv = {
        POSTGRES_HOST: process.env.POSTGRES_HOST,
        POSTGRES_PORT: process.env.POSTGRES_PORT,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
        PORT: process.env.PORT,
        JWT_SIGNING_SECRET: process.env.JWT_SIGNING_SECRET,
        VERBOSE: process.env.VERBOSE,
    };

    const parseResult = envSchema.safeParse(maybeEnv);
    if(parseResult.error) {
        throw new Error('Missing or invalid environment variables', { cause: parseResult.error });
    }

    return parseResult.data;
}
