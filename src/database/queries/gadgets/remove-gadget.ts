import { eq } from 'drizzle-orm';
import { gadgets } from '@/database/schema';
import { type getDB } from '@/database/db';
import { QueryError } from '@/utils/pg-error';

/**
 * @param drizzle drizzle instance
 * @param gadgetId id of the gadget
 */
export async function removeGadget(
    drizzle: ReturnType<typeof getDB>,
    gadgetId: string,
) {
    try {
        const [gadget] = await drizzle.update(gadgets)
        .set({ status: 'Destroyed' })
        .where(eq(gadgets.id, gadgetId))
        .returning();

        return gadget;
    } catch(err: unknown) {
        throw new QueryError({
            type: 'Unknown_Error',
            message: 'Unknown error',
            cause: err,
        });
    }
}
