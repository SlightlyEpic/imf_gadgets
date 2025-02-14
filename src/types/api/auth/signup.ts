import { z, ZodError } from 'zod';
import * as schema from '@/database/schema';
import { ValidationError } from '../errors';

export const signupBodySchema = z.object({
    email: z.string().email().min(1).max(64),
    password: z.string().min(1).max(64),
});

export type PostSignupBody = z.infer<typeof signupBodySchema>;

export type PostSignupSuccessResponse = {
    message: 'Signup successful',
    user: Omit<typeof schema.users.$inferSelect, 'passwordHash'>,
};

export type PostSignupErrorResponse = ValidationError<PostSignupBody> | {
    error: 'Unknown_Error' | 'Email_In_Use',
    errorMessage: string,
    details?: unknown,
};

