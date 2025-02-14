import { Router } from 'express';
import { type AppDependencies } from '@/types/app-DI';

import { gadgetsDeleteHandler, gadgetsGetHandler, gadgetsPatchHandler, gadgetsPostHandler } from '.';
import { selfDestructPostHandler } from './self-destruct';

export const gadgetsRouter = (di: AppDependencies): Router => {
    const router = Router({ mergeParams: true });

    router.get('/', gadgetsGetHandler(di));
    router.post('/', gadgetsPostHandler(di));
    router.patch('/', gadgetsPatchHandler(di));
    router.delete('/', gadgetsDeleteHandler(di));

    router.post('/:gadgetId/self-destruct', selfDestructPostHandler(di));

    return router;
}
