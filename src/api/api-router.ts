import { Router } from 'express';
import { type AppDependencies } from '@/types/app-DI';

import { authRouter } from './auth/auth-router';
import { gadgetsRouter } from './gadgets/gadgets-router';

export const apiRouter = (di: AppDependencies): Router => {
    const router = Router({ mergeParams: true });

    router.use('/auth', authRouter(di));
    router.use('/gadgets', gadgetsRouter(di));

    return router;
}
