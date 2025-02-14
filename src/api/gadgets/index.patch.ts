import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { ReqUser } from '@/middlewares/require-auth';
import { queries } from '@/database/queries';
import type { GadgetsPatchBody, GadgetsPatchErrorResponse, GadgetsPatchSuccessResponse } from '@/types/api/gadgets';
import { type QueryError } from '@/utils/pg-error';

export const gadgetsPatchHandler = (di: AppDependencies): RequestHandler =>
    async (req, res) => {
        // @ts-expect-error
        const user = req.user as ReqUser;
        const body = req.body as GadgetsPatchBody;

        try {
            const gadget = await queries.gadgets.updateGadgetIfOwned(
                di.drizzle, user.id, body.id, {
                    name: body.name,
                    status: body.status,
                }
            );

            const resp: GadgetsPatchSuccessResponse = {
                message: 'Successfully updated gadget info',
                gadget,
            };
            res.send(resp);
        } catch(_err: unknown) {
            const err = _err as QueryError;
            if(err.type === 'Unique_Violation') {
                const resp: GadgetsPatchErrorResponse = {
                    error: 'Duplicate_Name',
                    errorMessage: 'Another gadget with this name already exists',
                };
                res.status(400).send(resp);
            } else if(err.type === 'No_Match_Error') {
                const resp: GadgetsPatchErrorResponse = {
                    error: 'Invalid_Gadget_Id',
                    errorMessage: 'You don\'t have any gadget with this Id',
                };
                res.status(400).send(resp);
            } else {
                const resp: GadgetsPatchErrorResponse = {
                    error: 'Unknown_Error',
                    errorMessage: 'Unknown Error',
                };
                res.status(500).send(resp);
            }
        }
    };

