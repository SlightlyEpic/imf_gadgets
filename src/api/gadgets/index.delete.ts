import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { ReqUser } from '@/middlewares/require-auth';
import { queries } from '@/database/queries';
import type { GadgetsDeleteBody, GadgetsDeleteErrorResponse, GadgetsDeleteSuccessResponse } from '@/types/api/gadgets';
import { type QueryError } from '@/utils/pg-error';

export const gadgetsDeleteHandler = (di: AppDependencies): RequestHandler =>
    async (req, res) => {
        // @ts-expect-error
        const user = req.user as ReqUser;
        const body = req.body as GadgetsDeleteBody;

        try {
            const gadget = await queries.gadgets.getGadget(di.drizzle, body.id);

            if(!gadget) {
                const resp: GadgetsDeleteErrorResponse = {
                    error: 'Invalid_Gadget_Id',
                    errorMessage: 'You don\'t have any gadget with this Id',
                };
                res.status(400).send(resp);
                return;
            }

            if(gadget.status === 'Destroyed') {
                const resp: GadgetsDeleteErrorResponse = {
                    error: 'Gadget_Already_Decommissioned',
                    errorMessage: 'Gadget is already decommissioned',
                };
                res.status(400).send(resp);
                return;
            }

            await queries.gadgets.updateGadgetIfOwned(
                di.drizzle, user.id, body.id, {
                    status: 'Decommissioned',
                    decommissionedAt: new Date(),
                }
            );

            const resp: GadgetsDeleteSuccessResponse = {
                message: 'Gadget was decommissioned successfully',
            };
            res.send(resp);
        } catch(_err: unknown) {
            const err = _err as QueryError;
            if(err.type === 'No_Match_Error') {
                const resp: GadgetsDeleteErrorResponse = {
                    error: 'Invalid_Gadget_Id',
                    errorMessage: 'You don\'t have any gadget with this Id',
                };
                res.status(400).send(resp);
            } else {
                const resp: GadgetsDeleteErrorResponse = {
                    error: 'Unknown_Error',
                    errorMessage: 'Unknown Error',
                };
                res.status(500).send(resp);
            }
        }
    };
