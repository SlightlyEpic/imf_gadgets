import { Router } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { validateBody } from '@/middlewares/body-validator';

import { gadgetsDeleteHandler, gadgetsGetHandler, gadgetsPatchHandler, gadgetsPostHandler } from '.';
import { selfDestructPostHandler } from './self-destruct';
import { gadgetsDeleteSchema, gadgetsPatchSchema } from '@/types/api/gadgets';

export const gadgetsRouter = (di: AppDependencies): Router => {
    const router = Router({ mergeParams: true });

    router.get('/', gadgetsGetHandler(di));
    router.post('/', gadgetsPostHandler(di));
    router.patch('/', validateBody(gadgetsPatchSchema), gadgetsPatchHandler(di));
    router.delete('/', validateBody(gadgetsDeleteSchema), gadgetsDeleteHandler(di));

    router.post('/:gadgetId/self-destruct', selfDestructPostHandler(di));

    return router;
}
