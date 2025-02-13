import { eq } from 'drizzle-orm';
import { type getDB } from '@/database/db';
import { gadgets } from '@/database/schema';

/**
 * @param drizzle drizzle instance
 * @param userId userId from the users table
 */
export async function getUserGadgets(
    drizzle: ReturnType<typeof getDB>,
    userId: string,
) {
    const userGadgets = await drizzle.query.gadgets.findMany({
        where: eq(gadgets.ownerId, userId),
    });

    return userGadgets;
}
