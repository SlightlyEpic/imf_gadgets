import { Router } from 'express';
import { type AppDependencies } from '@/types/app-DI';

import { authRouter } from './auth/auth-router';
import { gadgetsRouter } from './gadgets/gadgets-router';
import { requireAuth } from '@/middlewares/require-auth';

/**
 * 
 * @swagger
 * /books:
 *   get:
 *     summary: Returns the list of all the books
 * 
 *     responses:
 *       200:
 *         description: The list of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

export const apiRouter = (di: AppDependencies): Router => {
    const router = Router({ mergeParams: true });

    router.use('/auth', authRouter(di));
    router.use('/gadgets', requireAuth(di), gadgetsRouter(di));

    return router;
}
