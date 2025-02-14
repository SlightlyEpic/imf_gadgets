import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { ReqUser } from '@/middlewares/require-auth';
import { queries } from '@/database/queries';
import { GadgetsDeleteBody, GadgetsDeleteErrorResponse, GadgetsDeleteSuccessResponse, GadgetsPatchBody, GadgetsPatchErrorResponse, GadgetsPatchSuccessResponse, GadgetsPostErrorResponse, type GadgetsGetSuccessResponse, type GadgetsPostSuccessResponse } from '@/types/api/gadgets';
import { gadgetStatus } from '@/database/schema/gadgets.sql';
import { randomGadgetName } from '@/utils/gadget-names';
import { type QueryError } from '@/utils/pg-error';

export const gadgetsGetHandler = (di: AppDependencies): RequestHandler =>
    async (req, res) => {
        // @ts-expect-error
        const user = req.user as ReqUser;
        let status: typeof gadgetStatus.enumValues[number] | undefined;

        if(Array.isArray(req.query['status'])) {
            // @ts-expect-error
            if(gadgetStatus.enumValues.includes(req.query['status'][0])) {
                status = req.query['status'][0] as unknown as typeof gadgetStatus.enumValues[number];
            }
        } else if(req.query['status']) {
            // @ts-expect-error
            if(gadgetStatus.enumValues.includes(req.query['status'])) {
                status = req.query['status'] as unknown as typeof gadgetStatus.enumValues[number];
            }
        }

        if(!status) {
            const gadgets = await queries.gadgets.getUserGadgets(di.drizzle, user.id);

            const resp: GadgetsGetSuccessResponse = {
                message: 'Successfully fetched gadgets',
                gadgets: gadgets.map(g => ({
                    ...g,
                    missionSuccessProbability: Math.floor(Math.random() * 100)
                }))
            }

            res.send(resp);
            return;
        }

        const gadgets = await queries.gadgets.getUserGadgetsByStatus(di.drizzle, user.id, status);
        const resp: GadgetsGetSuccessResponse = {
            message: 'Successfully fetched gadgets',
            gadgets: gadgets.map(g => ({
                ...g,
                missionSuccessProbability: Math.floor(Math.random() * 100)
            }))
        }

        res.send(resp);
    };

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
