import { ZodError } from 'zod';

export type ValidationError<T> = {
    error: 'Validation_Error',
    errorMessage: string,
    details: ZodError<T>,
}

export type AuthenticationError = {
    error: 'Authentication_Error',
    errorMessage: string,
    details?: unknown,
}
