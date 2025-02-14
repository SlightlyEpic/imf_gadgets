import { eq } from 'drizzle-orm';
import { users } from '@/database/schema/users.sql';
import { type getDB } from '@/database/db';

/**
 * @param drizzle drizzle instance
 * @param email email of the user
 * @param withRelations specifies which user relations to include
 */
export async function getUserByEmail(
    drizzle: ReturnType<typeof getDB>,
    email: string,
) {
    const user = await drizzle.query.users.findFirst({
        where: eq(users.email, email),
    });

    return user;
}
