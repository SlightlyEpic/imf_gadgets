import pg from 'postgres';
import { refreshTokens } from '@/database/schema';
import { type getDB } from '@/database/db';
import { isFKeyViolation, QueryError } from '@/utils/pg-error';

/**
 * @param drizzle drizzle instance
 * @param userId a valid userId
 * @param refreshToken a refresh token
 */
export async function addRefreshToken(
    drizzle: ReturnType<typeof getDB>,
    userId: string,
    refreshToken: string,
) {
    try {
        const [token] = await drizzle.insert(refreshTokens)
        .values({ userId, token: refreshToken })
        .returning();

        return token;
    } catch(err: unknown) {
        if(err instanceof pg.PostgresError && isFKeyViolation(err)) {
            throw new QueryError({
                type: 'Integrity_Violation',
                message: 'Invalid User Id',
                cause: err,
            });
        } else {
            throw new QueryError({
                type: 'Unknown_Error',
                message: 'Unknown error',
                cause: err,
            });
        }
    }
}
