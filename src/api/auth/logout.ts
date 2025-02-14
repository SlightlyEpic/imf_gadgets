import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { LogoutPostSuccessResponse } from '@/types/api/auth/logout';

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout
 *     description: Logs out the user by clearing authentication cookies.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful. Clears authentication cookies.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: AccessToken=; HttpOnly; Max-Age=0
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */

export const logoutPostHandler = (di: AppDependencies): RequestHandler => 
    (req, res) => {
        res
            .clearCookie('AccessToken', { httpOnly: true })
            .clearCookie('RefreshToken', { httpOnly: true })
            .send({
                message: 'Logout successful'
            } satisfies LogoutPostSuccessResponse);
    }
