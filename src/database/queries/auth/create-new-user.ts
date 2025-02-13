import pg from 'postgres';
import { users } from '@/database/schema';
import { type getDB } from '@/database/db';
import { isUniqueViolation, QueryError } from '@/utils/pg-error';

/**
 * @param drizzle drizzle instance
 * @param email a valid email
 * @param passwordHash hashed password
 */
export async function createNewUser(
    drizzle: ReturnType<typeof getDB>,
    email: string,
    passwordHash: string,
) {
    try {
        const [user] = await drizzle.insert(users)
        .values({ email, passwordHash })
        .returning();

        return user;
    } catch(err: unknown) {
        if(err instanceof pg.PostgresError && isUniqueViolation(err)) {
            throw new QueryError({
                type: 'Unique_Violation',
                message: 'Email already in use',
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
