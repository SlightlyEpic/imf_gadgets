import { relations } from 'drizzle-orm';
import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { gadgets } from './gadgets.sql';
import { refreshTokens } from './refreshTokens.sql';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
    gadgets: many(gadgets),
    refreshTokens: many(refreshTokens),
}));
