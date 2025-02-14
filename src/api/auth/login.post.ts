import bcrypt from 'bcryptjs';
import { queries } from '@/database/queries';
import * as jwtHelper from '@/lib/jwt';
import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import type { LoginPostBody, LoginPostErrorResponse, LoginPostSuccessResponse } from '@/types/api/auth/login';
import { QueryError } from '@/utils/pg-error';

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     description: |
 *       Login endpoint to authenticate a user and get access and refresh tokens.<br />
 *       Demo credentials - <br />
 *       email - `user@example.com` <br />
 *       password - `password123`
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful. Returns user details and sets access and refresh tokens as cookies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 12345
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: AccessToken=<token>; HttpOnly; SameSite=Strict; Max-Age=3600
 *       400:
 *         description: Invalid credentials provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid_Credentials
 *                 errorMessage:
 *                   type: string
 *                   example: Invalid Credentials
 *       500:
 *         description: Internal server error.
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

export const loginPostHandler = (di: AppDependencies): RequestHandler => 
    async (req, res) => {
        const body = req.body as LoginPostBody;

        const user = await queries.auth.getUserByEmail(di.drizzle, body.email);

        if(!user) {
            const resp: LoginPostErrorResponse = {
                error: 'Invalid_Credentials',
                errorMessage: 'Invalid Credentials'
            };
            res.status(400).send(resp);
            return;
        }

        const passwordMatches = bcrypt.compareSync(body.password, user.passwordHash);

        if(!passwordMatches) {
            const resp: LoginPostErrorResponse = {
                error: 'Invalid_Credentials',
                errorMessage: 'Invalid Credentials'
            };
            res.status(400).send(resp);
            return;
        }

        const [accessTokenStr, refreshTokenStr] = jwtHelper.createTokensForUser(di.env, user);
        const resp: LoginPostSuccessResponse = {
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
            }
        };

        try {
            await queries.auth.addRefreshToken(di.drizzle, user.id, refreshTokenStr);
            res
                .cookie('AccessToken', accessTokenStr, { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 })
                .cookie('RefreshToken', refreshTokenStr, { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 30 })
                .send(resp);
        } catch(_err: unknown) {
            const err = _err as QueryError;

            res.status(500).send({
                error: 'Unknown_Error',
                errorMessage: 'Unknown Error',
            } satisfies LoginPostErrorResponse);
        }
    }
