import 'dotenv/config';
import { createApp } from './app';
import { getDB } from './database/db';
import { ConsoleLogger } from './utils/logger';
import { readEnv } from './utils/env';
import { AppDependencies } from './types/app-DI';

const env = readEnv();
const drizzle = getDB();
const logger = new ConsoleLogger(env.VERBOSE);

const di: AppDependencies = {
    drizzle,
    logger,
    env,
};

const app = createApp(di);
app.listen(Number(env.PORT), () => {
    console.log(`Listening on port ${env.PORT}`);
});
