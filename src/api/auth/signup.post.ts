import z from 'zod';
import bcrypt from 'bcryptjs';
import { signupBodySchema, SignupPostErrorResponse, SignupPostSuccessResponse } from '@/types/api/auth/signup';
import { queries } from '@/database/queries';
import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { type QueryError } from '@/utils/pg-error';

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Signup
 *     description: Signup endpoint to create a new user.
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
 *         description: Signup successful. Returns the newly created user's details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Signup successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 12345
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *       400:
 *         description: |
 *           Bad request. This can occur if the email is already in use or if there is
 *           an unknown error during the signup process.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: Email_In_Use
 *                     errorMessage:
 *                       type: string
 *                       example: Email is already in use
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: Unknown_Error
 *                     errorMessage:
 *                       type: string
 *                       example: An unknown error occurred
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

export const signupPostHandler = (di: AppDependencies): RequestHandler => 
    async (req, res) => {
        const body = req.body as z.infer<typeof signupBodySchema>;

        try {
            const salt = bcrypt.genSaltSync(10);
            const passwordHash = bcrypt.hashSync(body.password, salt);
            const user = await queries.auth.createNewUser(di.drizzle, body.email, salt, passwordHash);

            const resp: SignupPostSuccessResponse = {
                message: 'Signup successful',
                user: {
                    id: user.id,
                    email: user.email,
                }
            };

            res.send(resp);
        } catch(_err: unknown) {
            const err = _err as QueryError;

            if(err.type === 'Unique_Violation') {
                const resp: SignupPostErrorResponse = {
                    error: 'Email_In_Use',
                    errorMessage: 'Email is already in use',
                };

                res.status(400).send(resp);
            } else {
                const resp: SignupPostErrorResponse = {
                    error: 'Unknown_Error',
                    errorMessage: err.message,
                };

                res.status(400).send(resp);
            }
        }
    }
