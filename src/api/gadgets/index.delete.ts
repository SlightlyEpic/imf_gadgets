import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { ReqUser } from '@/middlewares/require-auth';
import { queries } from '@/database/queries';
import type { GadgetsDeleteErrorResponse, GadgetsDeleteSuccessResponse } from '@/types/api/gadgets';
import { isUUID, type QueryError } from '@/utils/pg-error';

/**
 * @swagger
 * /api/gadgets:
 *   delete:
 *     summary: Decommission a gadget
 *     description: Marks a user's gadget as "Decommissioned" if it exists and is not already destroyed.
 *     tags:
 *       - Gadgets
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the gadget to decommission.
 *     responses:
 *       200:
 *         description: Gadget successfully decommissioned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gadget was decommissioned successfully"
 *       400:
 *         description: Invalid gadget ID or gadget already decommissioned.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Invalid_Gadget_Id"
 *                     errorMessage:
 *                       type: string
 *                       example: "You don't have any gadget with this Id"
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Gadget_Already_Decommissioned"
 *                     errorMessage:
 *                       type: string
 *                       example: "Gadget is already decommissioned"
 *       500:
 *         description: Internal server error.
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

export const gadgetsDeleteHandler = (di: AppDependencies): RequestHandler =>
    async (req, res) => {
        // @ts-expect-error
        const user = req.user as ReqUser;
        let gadgetId: string | undefined;

        if(Array.isArray(req.query['id'])) {
            gadgetId = req.query['id'][0] as string;
        } else if(req.query['id']) {
            gadgetId = req.query['id'] as string;
        }

        if(!gadgetId || !isUUID(gadgetId)) {
            const resp: GadgetsDeleteErrorResponse = {
                error: 'Invalid_Gadget_Id',
                errorMessage: 'You don\'t have any gadget with this Id',
            };
            res.status(400).send(resp);
            return;
        }

        try {
            const gadget = await queries.gadgets.getGadget(di.drizzle, gadgetId);

            if(!gadget) {
                const resp: GadgetsDeleteErrorResponse = {
                    error: 'Invalid_Gadget_Id',
                    errorMessage: 'You don\'t have any gadget with this Id',
                };
                res.status(400).send(resp);
                return;
            }

            if(gadget.status === 'Decommissioned') {
                const resp: GadgetsDeleteErrorResponse = {
                    error: 'Gadget_Already_Decommissioned',
                    errorMessage: 'Gadget is already decommissioned',
                };
                res.status(400).send(resp);
                return;
            }

            await queries.gadgets.updateGadgetIfOwned(
                di.drizzle, user.id, gadgetId, {
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
