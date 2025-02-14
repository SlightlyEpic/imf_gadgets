import { z } from 'zod';
import * as schema from '@/database/schema';
import { ValidationError } from '../errors';

export const loginBodySchema = z.object({
    email: z.string().email().min(1).max(64),
    password: z.string().min(1).max(64),
});

export type LoginPostBody = z.infer<typeof loginBodySchema>;

export type LoginPostSuccessResponse = {
    message: string,
    user: Omit<typeof schema.users.$inferSelect, 'passwordHash' | 'salt'>,
};

export type LoginPostErrorResponse = ValidationError<LoginPostBody> | {
    error: 'Unknown_Error' | 'Invalid_Credentials',
    errorMessage: string,
    details?: unknown,
};
