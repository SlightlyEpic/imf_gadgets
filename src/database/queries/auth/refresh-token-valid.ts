import { and, eq } from 'drizzle-orm';
import { refreshTokens } from '@/database/schema';
import { type getDB } from '@/database/db';

/**
 * @param drizzle drizzle instance
 * @param userId a valid userId
 * @param refreshToken a refresh token
 */
export async function isRefreshTokenValid(
    drizzle: ReturnType<typeof getDB>,
    userId: string,
    refreshToken: string,
) {
    const token = await drizzle.query.refreshTokens.findFirst({
        where: and(
            eq(refreshTokens.userId, userId),
            eq(refreshTokens.token, refreshToken)
        )
    });

    return token !== undefined;
}
