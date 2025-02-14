import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { SelfDestructErrorResponse, SelfDestructPostBody, SelfDestructSuccessResponse } from '@/types/api/gadgets/self-destruct';
import { queries } from '@/database/queries';
import { isUUID, QueryError } from '@/utils/pg-error';

/**
 * @swagger
 * /api/gadgets/{gadgetId}/self-destruct:
 *   post:
 *     summary: Self-destruct a gadget
 *     description: |
 *       Permanently marks a user's gadget as "Destroyed" if the correct confirmation code is provided.<br>
 *       Confirmation code is always `123123` for now.
 *     tags:
 *       - Gadgets
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: gadgetId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the gadget to be self-destructed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123123"
 *                 description: Confirmation code required to trigger self-destruction.
 *     responses:
 *       200:
 *         description: Gadget successfully self-destructed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gadget was destroyed successfully"
 *       400:
 *         description: Invalid request due to incorrect confirmation code or gadget status.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Invalid_Code"
 *                     errorMessage:
 *                       type: string
 *                       example: "Confirmation code is incorrect"
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
 *                       example: "Gadget_Already_Destroyed"
 *                     errorMessage:
 *                       type: string
 *                       example: "Gadget is already destroyed"
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

        if(!gadgetId || !isUUID(gadgetId)) {
                    const resp: SelfDestructErrorResponse = {
                        error: 'Invalid_Gadget_Id',
                        errorMessage: 'You don\'t have any gadget with this Id',
                    };
                    res.status(400).send(resp);
                    return;
                }

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
