import pg from 'postgres';
import { gadgets } from '@/database/schema';
import { type getDB } from '@/database/db';
import { isFKeyViolation, isUniqueViolation, QueryError } from '@/utils/pg-error';

/**
 * @param drizzle drizzle instance
 * @param ownerId id of the gadget owner
 * @param name name of the gadget
 */
export async function createGadget(
    drizzle: ReturnType<typeof getDB>,
    ownerId: string,
    name: string,
) {
    try {
        const [gadget] = await drizzle.insert(gadgets)
        .values({
            name,
            ownerId,
            status: 'Available',
        })
        .returning();

        return gadget;
    } catch(err: unknown) {
        if(err instanceof pg.PostgresError && isUniqueViolation(err)) {
            throw new QueryError({
                type: 'Unique_Violation',
                message: 'Gadget name is already in use',
                cause: err,
            });
        } else if(err instanceof pg.PostgresError && isFKeyViolation(err)) {
            throw new QueryError({
                type: 'Integrity_Violation',
                message: 'Invalid owner id',
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
