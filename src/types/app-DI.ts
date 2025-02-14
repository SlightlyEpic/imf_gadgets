import { type getDB } from '@/database/db';
import { type ILogger } from './logger';
import { type Env } from './env';

export type AppDependencies = {
    drizzle: ReturnType<typeof getDB>,
    logger: ILogger,
    env: Env,   // Injecting env allows mocking it for tests
};
