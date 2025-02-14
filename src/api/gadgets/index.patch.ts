import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { ReqUser } from '@/middlewares/require-auth';
import { queries } from '@/database/queries';
import type { GadgetsPatchBody, GadgetsPatchErrorResponse, GadgetsPatchSuccessResponse } from '@/types/api/gadgets';
import { type QueryError } from '@/utils/pg-error';

/**
 * @swagger
 * /api/gadgets:
 *   patch:
 *     summary: Update an existing gadget
 *     description: Allows users to update the name or status of a gadget they own.
 *     tags:
 *       - Gadgets
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               name:
 *                 type: string
 *                 example: "The Kraken"
 *               status:
 *                 type: string
 *                 enum: ["Available", "Deployed", "Destroyed", "Decommissioned"]
 *                 example: "Deployed"
 *     responses:
 *       200:
 *         description: Successfully updated gadget info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully updated gadget info"
 *                 gadget:
 *                   $ref: "#/components/schemas/Gadget"
 *       400:
 *         description: Invalid request (e.g., duplicate name, invalid gadget ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Duplicate_Name"
 *                 errorMessage:
 *                   type: string
 *                   example: "Another gadget with this name already exists"
 *       500:
 *         description: Unexpected server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unknown_Error"
 *                 errorMessage:
 *                   type: string
 *                   example: "Unknown Error"
 */

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
