import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';

export const selfDestructPostHandler = (di: AppDependencies): RequestHandler =>
    (req, res) => {

    };
