import { z } from 'zod';
import * as schema from '@/database/schema';
import { ValidationError } from '../errors';

export const loginBodySchema = z.object({
    email: z.string().email().min(1).max(64),
    password: z.string().min(1).max(64),
});

export type PostLoginBody = z.infer<typeof loginBodySchema>;

export type PostLoginSuccessResponse = {
    message: 'Login successful',
    user: Omit<typeof schema.users.$inferSelect, 'passwordHash'>,
};

export type PostLoginErrorResponse = ValidationError<PostLoginBody> | {
    error: 'Unknown_Error' | 'Invalid_Credentials',
    errorMessage: string,
    details?: unknown,
};
