import { Router } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { validateBody } from '@/middlewares/body-validator';

import { selfDestructPostHandler } from './self-destruct.post';
import { gadgetsPatchSchema } from '@/types/api/gadgets';
import { gadgetsGetHandler } from './index.get';
import { gadgetsPostHandler } from './index.post';
import { gadgetsPatchHandler } from './index.patch';
import { gadgetsDeleteHandler } from './index.delete';

export const gadgetsRouter = (di: AppDependencies): Router => {
    const router = Router({ mergeParams: true });

    router.get('/', gadgetsGetHandler(di));
    router.post('/', gadgetsPostHandler(di));
    router.patch('/', validateBody(gadgetsPatchSchema), gadgetsPatchHandler(di));
    router.delete('/', gadgetsDeleteHandler(di));

    router.post('/:gadgetId/self-destruct', selfDestructPostHandler(di));

    return router;
}
