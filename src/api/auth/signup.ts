import z from 'zod';
import bcrypt from 'bcryptjs';
import { signupBodySchema, SignupPostErrorResponse, SignupPostSuccessResponse } from '@/types/api/auth/signup';
import { queries } from '@/database/queries';
import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { type QueryError } from '@/utils/pg-error';

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
