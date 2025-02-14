import { Router } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { validateBody } from '@/middlewares/body-validator';

import { loginPostHandler } from './login';
import { signupPostHandler } from './signup';
import { logoutPostHandler } from './logout';
import { loginBodySchema } from '@/types/api/auth/login';
import { signupBodySchema } from '@/types/api/auth/signup';

export const authRouter = (di: AppDependencies): Router => {
    const router = Router({ mergeParams: true });

    router.post('/login', validateBody(loginBodySchema), loginPostHandler(di));
    router.post('/signup', validateBody(signupBodySchema), signupPostHandler(di));
    router.post('/logout', logoutPostHandler(di));

    return router;
}
