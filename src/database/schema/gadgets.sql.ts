import { relations } from 'drizzle-orm';
import { pgTable, varchar, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.sql';

export const gadgetStatus = pgEnum('gadget_status', ['Available', 'Deployed', 'Destroyed', 'Decommissioned']);

export const gadgets = pgTable('gadgets', {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id').references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }).notNull(),
    name: varchar('name', { length: 128 }).notNull().unique(),
    status: gadgetStatus('status').notNull(),
});

export const gadgetRelations = relations(gadgets, ({ one }) => ({
    owner: one(users, {
        fields: [gadgets.ownerId],
        references: [users.id],
    })
}));
