import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { ReqUser } from '@/middlewares/require-auth';
import { queries } from '@/database/queries';
import { type GadgetsGetSuccessResponse } from '@/types/api/gadgets';
import { gadgetStatus } from '@/database/schema/gadgets.sql';

/**
 * @openapi
 * /api/gadgets:
 *   get:
 *     summary: List your gadgets
 *     description: Retrieve a list of gadgets owned by the authenticated user.
 *     tags:
 *       - Gadgets
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["Available", "Deployed", "Destroyed", "Decommissioned"]
 *         required: false
 *         description: Filter gadgets by their status.
 *     responses:
 *       200:
 *         description: Successfully retrieved gadgets.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched gadgets
 *                 gadgets:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/GadgetWithSuccessProbability"
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid_Request
 *                 errorMessage:
 *                   type: string
 *                   example: Invalid status value provided
 *       403:
 *         description: Authentication error. The user must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication_Error
 *                 errorMessage:
 *                   type: string
 *                   example: Authentication required
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal_Server_Error
 *                 errorMessage:
 *                   type: string
 *                   example: Something went wrong on the server
 */

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

