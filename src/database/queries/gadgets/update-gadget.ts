import pg from 'postgres';
import { eq } from 'drizzle-orm';
import { gadgets } from '@/database/schema';
import { type getDB } from '@/database/db';
import { isUniqueViolation, QueryError } from '@/utils/pg-error';

/**
 * @param drizzle drizzle instance
 * @param gadgetId id of the gadget
 * @param updates fields and values that should be updated
 */
export async function updateGadget(
    drizzle: ReturnType<typeof getDB>,
    gadgetId: string,
    updates: Partial<Omit<typeof gadgets.$inferInsert, 'id'>>
) {
    try {
        const [gadget] = await drizzle.update(gadgets)
        .set(updates)
        .where(eq(gadgets.id, gadgetId))
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
