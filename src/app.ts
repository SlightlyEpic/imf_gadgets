import express from 'express';
import cookieParser from 'cookie-parser';
import { type AppDependencies } from './types/app-DI';
import { apiRouter } from './api/api-router';

export function createApp(di: AppDependencies): ReturnType<typeof express> {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use('/api', apiRouter(di));

    return app;
}
