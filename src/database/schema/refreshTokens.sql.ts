import { relations } from 'drizzle-orm';
import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { users } from './users.sql';

// We are storing refresh tokens to allow invalidating them
export const refreshTokens = pgTable('refresh_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }).notNull(),
    token: text('token').notNull(),
});

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id],
    })
}));

