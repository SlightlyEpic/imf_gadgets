import { eq } from 'drizzle-orm';
import { type getDB } from '@/database/db';
import { gadgets } from '@/database/schema';

/**
 * @param drizzle drizzle instance
 * @param gadgetId id of the gadget
 */
export async function getGadget(
    drizzle: ReturnType<typeof getDB>,
    gadgetId: string,
) {
    const gadget = await drizzle.query.gadgets.findFirst({
        where: eq(gadgets.id, gadgetId),
    });

    return gadget;
}
