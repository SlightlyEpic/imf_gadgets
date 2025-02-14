import jwt from 'jsonwebtoken';
import type * as schema from '@/database/schema';
import type { AccessToken, RefreshToken } from '@/types/tokens';
import type { Env } from '@/types/env';

export function createTokensForUser(env: Env, user: typeof schema.users.$inferSelect): [accessTokenString: string, refreshTokenString: string] {
    const now = Math.floor(Date.now() / 1000);

    const accessTokenString = jwt.sign(
        {
            iss: 'IMF Gadgets API',
            iat: now,
            exp: 60 * 60,   // 1 hour
            sub: user.id,
            email: user.email,
            type: 'access',
        } satisfies AccessToken,
        env.JWT_SIGNING_SECRET
    );

    const refreshTokenString = jwt.sign(
        {
            iss: 'IMF Gadgets API',
            iat: now,
            exp: 30 * 24 * 60 * 60,   // 1 month
            sub: user.id,
            email: user.email,
            type: 'refresh',
        } satisfies RefreshToken,
        env.JWT_SIGNING_SECRET
    );

    return [accessTokenString, refreshTokenString];
}

export function accessTokenFromRefreshToken(env: Env, refreshToken: RefreshToken): string {
    const now = Math.floor(Date.now() / 1000);

    const accessTokenString = jwt.sign(
        {
            iss: 'IMF Gadgets API',
            iat: now,
            exp: 60 * 60,   // 1 hour
            sub: refreshToken.sub,
            email: refreshToken.email,
            type: 'access',
        } satisfies AccessToken,
        env.JWT_SIGNING_SECRET
    );

    return accessTokenString;
}

function verifyPromise(s: string, secret: string, opts: Parameters<typeof jwt.verify>[2]) {
    return new Promise((resolve, reject) => {
        jwt.verify(s, secret, opts, (err, decoded) => {
            if(err) reject(err);
            else resolve(decoded);
        })
    });
}

type VerifyError = 'UnknownError' | 'TokenExpiredError' | 'InvalidTokenError';
export async function verifyAccessTokenString(env: Env, accessTokenString: string): Promise<AccessToken | VerifyError> {
    try {
        const _token = await verifyPromise(accessTokenString, env.JWT_SIGNING_SECRET, {
            issuer: 'IMF Gadgets API',
            maxAge: '1h',
        }) as AccessToken;

        if(_token.type !== 'access') return 'InvalidTokenError';

        const token: AccessToken = {
            iss: _token.iss,
            iat: _token.iat,
            exp: _token.exp,
            sub: _token.sub,
            email: _token.email,
            type: _token.type,
        };

        return token;
    } catch(err: any) {
        if(err.name === 'TokenExpiredError') return 'TokenExpiredError';
        if(err.name === 'JsonWebTokenError') return 'InvalidTokenError';
        return 'UnknownError';
    }
}

export async function verifyRefreshTokenString(env: Env, refreshTokenString: string): Promise<RefreshToken | VerifyError> {
    try {
        const _token = await verifyPromise(refreshTokenString, env.JWT_SIGNING_SECRET, {
            issuer: 'IMF Gadgets API',
            maxAge: '30d',
        }) as RefreshToken;

        if(_token.type !== 'refresh') return 'InvalidTokenError';

        const token: RefreshToken = {
            iss: _token.iss,
            iat: _token.iat,
            exp: _token.exp,
            sub: _token.sub,
            email: _token.email,
            type: _token.type,
        };

        return token;
    } catch(err: any) {
        if(err.name === 'TokenExpiredError') return 'TokenExpiredError';
        if(err.name === 'JsonWebTokenError') return 'InvalidTokenError';
        return 'UnknownError';
    }
}
