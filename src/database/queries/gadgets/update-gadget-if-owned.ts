import pg from 'postgres';
import { and, eq } from 'drizzle-orm';
import { gadgets } from '@/database/schema';
import { type getDB } from '@/database/db';
import { isUniqueViolation, QueryError } from '@/utils/pg-error';

/**
 * @param drizzle drizzle instance
 * @param userId id of the gadget owner
 * @param gadgetId id of the gadget
 * @param updates fields and values that should be updated
 */
export async function updateGadgetIfOwned(
    drizzle: ReturnType<typeof getDB>,
    userId: string,
    gadgetId: string,
    updates: Partial<Omit<typeof gadgets.$inferInsert, 'id' | 'ownerId'>>
) {
    try {
        const [gadget] = await drizzle.update(gadgets)
        .set(updates)
        .where(and(
            eq(gadgets.ownerId, userId),
            eq(gadgets.id, gadgetId),
        ))
        .returning();

        return gadget;
    } catch(err: unknown) {
        if(err instanceof pg.PostgresError && isUniqueViolation(err)) {
            throw new QueryError({
                type: 'Unique_Violation',
                message: 'Gadget name is already in use',
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
