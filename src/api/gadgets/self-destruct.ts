import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { SelfDestructErrorResponse, SelfDestructPostBody, SelfDestructSuccessResponse } from '@/types/api/gadgets/self-destruct';
import { queries } from '@/database/queries';
import { QueryError } from '@/utils/pg-error';

export const selfDestructPostHandler = (di: AppDependencies): RequestHandler =>
    async (req, res) => {
        // @ts-expect-error
        const user = req.user as ReqUser;
        const body = req.body as SelfDestructPostBody;

        if(body.code !== '123123') {
            const resp: SelfDestructErrorResponse = {
                error: 'Invalid_Code',
                errorMessage: 'Confirmation code is incorrect',
            };
            res.status(400).send(resp);
            return;
        }

        const gadgetId = req.params['gadgetId'];

        try {
            const gadget = await queries.gadgets.getGadget(di.drizzle, gadgetId);

            if(!gadget) {
                const resp: SelfDestructErrorResponse = {
                    error: 'Invalid_Gadget_Id',
                    errorMessage: 'You don\'t have any gadget with this Id',
                };
                res.status(400).send(resp);
                return;
            }

            if(gadget.status === 'Destroyed') {
                const resp: SelfDestructErrorResponse = {
                    error: 'Gadget_Already_Destroyed',
                    errorMessage: 'Gadget is already destroyed',
                };
                res.status(400).send(resp);
                return;
            }

            await queries.gadgets.updateGadgetIfOwned(
                di.drizzle, user.id, gadgetId, {
                    status: 'Destroyed',
                    decommissionedAt: new Date(),
                }
            );

            const resp: SelfDestructSuccessResponse = {
                message: 'Gadget was destroyed successfully',
            };
            res.send(resp);
        } catch(_err: unknown) {
            const err = _err as QueryError;
            if(err.type === 'No_Match_Error') {
                const resp: SelfDestructErrorResponse = {
                    error: 'Invalid_Gadget_Id',
                    errorMessage: 'You don\'t have any gadget with this Id',
                };
                res.status(400).send(resp);
            } else {
                const resp: SelfDestructErrorResponse = {
                    error: 'Unknown_Error',
                    errorMessage: 'Unknown Error',
                };
                res.status(500).send(resp);
            }
        }
    };
