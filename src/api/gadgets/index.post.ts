import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { ReqUser } from '@/middlewares/require-auth';
import { queries } from '@/database/queries';
import type { GadgetsPostErrorResponse, GadgetsPostSuccessResponse } from '@/types/api/gadgets';
import { randomGadgetName } from '@/utils/gadget-names';
import { type QueryError } from '@/utils/pg-error';

export const gadgetsPostHandler = (di: AppDependencies): RequestHandler =>
    async (req, res) => {
        // @ts-expect-error
        const user = req.user as ReqUser;
        const randomName = randomGadgetName();

        try {
            const gadget = await queries.gadgets.createGadget(di.drizzle, user.id, randomName);

            const resp: GadgetsPostSuccessResponse = {
                message: 'Successfully created gadget',
                gadget,
            };

            res.send(resp);
        } catch(_err: unknown) {
            const err = _err as QueryError;
            if(err.type === 'Integrity_Violation') {
                const resp: GadgetsPostErrorResponse = {
                    error: 'Invalid_User_Id',
                    errorMessage: 'Invalid User Id'
                };
                res.status(400).send(resp);
            } else {
                const resp: GadgetsPostErrorResponse = {
                    error: 'Unknown_Error',
                    errorMessage: 'Unknown Error'
                };
                res.status(500).send(resp);
            }
        }
    };
