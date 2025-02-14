import { type RequestHandler } from 'express';
import { AuthenticationError } from '@/types/api/errors';
import { AppDependencies } from '@/types/app-DI';
import * as jwtHelper from '@/lib/jwt';
import { AccessToken } from '@/types/tokens';
import { queries } from '@/database/queries';

export type ReqUser = {
    id: string,
    email: string,
};

export const requireAuth = (di: AppDependencies): RequestHandler =>
    async (req, res, next) => {
        let accessTokenStr: string | undefined = req.cookies['AccessToken'];
        let refreshTokenStr: string | undefined = req.cookies['RefreshToken'];

        if(!accessTokenStr && !refreshTokenStr) {
            res.status(403).send({
                error: 'Authentication_Error',
                errorMessage: 'Authentication required',
            } satisfies AuthenticationError);
            return;
        }

        let reissue = false;
        let accessToken: AccessToken | undefined;

        if(!accessTokenStr) {
            reissue = true;
        } else {
            const _accessToken = await jwtHelper.verifyAccessTokenString(di.env, accessTokenStr);
            if(typeof _accessToken === 'string') {
                if(_accessToken === 'TokenExpiredError') reissue = true;
                else {
                    res.status(403).send({
                        error: 'Authentication_Error',
                        errorMessage: 'Invalid Access Token',
                    } satisfies AuthenticationError);
                    return;
                }
            } else {
                accessToken = _accessToken;
            }
        }

        if(reissue) {
            // Reissue access token using refresh token

            const refreshToken = await jwtHelper.verifyRefreshTokenString(di.env, refreshTokenStr!);
            if(typeof refreshToken === 'string') {
                // Token error
                res.status(403).send({
                    error: 'Authentication_Error',
                    errorMessage: 'Authentication required',
                } satisfies AuthenticationError);
                return;
            }

            const isRefreshValid = await queries.auth.isRefreshTokenValid(di.drizzle, refreshToken.sub, refreshTokenStr!);
            if(!isRefreshValid) {
                // Refresh token was removed from db, disallow reissuing
                res.status(403).send({
                    error: 'Authentication_Error',
                    errorMessage: 'Authentication required',
                } satisfies AuthenticationError);
                return;
            }

            accessTokenStr = jwtHelper.accessTokenFromRefreshToken(di.env, refreshToken);
            res.cookie('AccessToken', accessTokenStr, { httpOnly: true, sameSite: true, maxAge: 1000 * 60 * 60 });
            accessToken = await jwtHelper.verifyAccessTokenString(di.env, accessTokenStr) as AccessToken;
        }

        // @ts-expect-error
        req.user = {
            id: accessToken!.sub,
            email: accessToken!.email,
        } satisfies ReqUser;

        next();
    };
