import { and, eq } from 'drizzle-orm';
import { type getDB } from '@/database/db';
import { gadgets } from '@/database/schema';

/**
 * @param drizzle drizzle instance
 * @param userId userId from the users table
 */
export async function getUserGadgetsByStatus(
    drizzle: ReturnType<typeof getDB>,
    userId: string,
    status: typeof gadgets.$inferSelect['status']
) {
    const userGadgets = await drizzle.query.gadgets.findMany({
        where: and(
            eq(gadgets.ownerId, userId),
            eq(gadgets.status, status),
        )
    });

    return userGadgets;
}
