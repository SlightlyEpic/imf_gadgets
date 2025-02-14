import { ZodError } from 'zod';

export type ValidationError<T> = {
    error: 'Validation_Error',
    errorMessage: string,
    details: ZodError<T>,
}
