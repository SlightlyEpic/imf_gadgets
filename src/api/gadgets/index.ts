import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { ReqUser } from '@/middlewares/require-auth';
import { queries } from '@/database/queries';
import { GadgetsPostErrorResponse, type GadgetsGetSuccessResponse, type GadgetsPostSuccessResponse } from '@/types/api/gadgets';
import { gadgetStatus } from '@/database/schema/gadgets.sql';
import { randomGadgetName } from '@/utils/gadget-names';
import { QueryError } from '@/utils/pg-error';

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
                res.send(resp);
            } else {
                const resp: GadgetsPostErrorResponse = {
                    error: 'Unknown_Error',
                    errorMessage: 'Unknown Error'
                };
                res.send(resp);
            }
        }
    };

export const gadgetsPatchHandler = (di: AppDependencies): RequestHandler =>
    (req, res) => {

    };

export const gadgetsDeleteHandler = (di: AppDependencies): RequestHandler =>
    (req, res) => {

    };
