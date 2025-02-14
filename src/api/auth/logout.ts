import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';

export const logoutPostHandler = (di: AppDependencies): RequestHandler => 
    (req, res, next) => {
        
    }
