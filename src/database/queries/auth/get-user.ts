import { eq } from 'drizzle-orm';
import { users } from '@/database/schema/users.sql';
import { type getDB } from '@/database/db';

/**
 * @param drizzle drizzle instance
 * @param userId userId from the users table
 * @param withRelations specifies which user relations to include
 */
export async function getUser(
    drizzle: ReturnType<typeof getDB>,
    userId: string,
) {
    const user = await drizzle.query.users.findFirst({
        where: eq(users.id, userId),
    });

    return user;
}
