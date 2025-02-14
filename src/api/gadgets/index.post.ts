import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { ReqUser } from '@/middlewares/require-auth';
import { queries } from '@/database/queries';
import type { GadgetsPostErrorResponse, GadgetsPostSuccessResponse } from '@/types/api/gadgets';
import { randomGadgetName } from '@/utils/gadget-names';
import { type QueryError } from '@/utils/pg-error';

/**
 * @swagger
 * /api/gadgets:
 *   post:
 *     summary: Create a new gadget
 *     description: Adds a new gadget to the user's inventory with a randomly generated codename.
 *     tags:
 *       - Gadgets
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Successfully created a new gadget.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully created gadget
 *                 gadget:
 *                   $ref: '#/components/schemas/Gadget'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid_User_Id
 *                 errorMessage:
 *                   type: string
 *                   example: Invalid User Id
 *       500:
 *         description: Unknown error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unknown_Error
 *                 errorMessage:
 *                   type: string
 *                   example: Unknown Error
 */

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
