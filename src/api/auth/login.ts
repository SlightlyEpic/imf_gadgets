import bcrypt from 'bcryptjs';
import { queries } from '@/database/queries';
import * as jwtHelper from '@/lib/jwt';
import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import type { LoginPostBody, LoginPostErrorResponse, LoginPostSuccessResponse } from '@/types/api/auth/login';
import { QueryError } from '@/utils/pg-error';

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
                .cookie('AccessToken', accessTokenStr, { httpOnly: true, sameSite: true, maxAge: 1000 * 60 * 60 })
                .cookie('RefreshToken', refreshTokenStr, { httpOnly: true, sameSite: true, maxAge: 1000 * 60 * 60 * 24 * 30 })
                .send(resp);
        } catch(_err: unknown) {
            const err = _err as QueryError;

            res.status(500).send({
                error: 'Unknown_Error',
                errorMessage: 'Unknown Error',
            } satisfies LoginPostErrorResponse);
        }
    }
