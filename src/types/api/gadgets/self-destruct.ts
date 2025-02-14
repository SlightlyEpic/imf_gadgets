import z from 'zod';
import { AuthenticationError, ValidationError } from '../errors';

export const selfDestructSchema = z.object({
    code: z.string().length(6),
});

export type SelfDestructPostBody = z.infer<typeof selfDestructSchema>;

export type SelfDestructSuccessResponse = {
    message: string,
}

export type SelfDestructErrorResponse = AuthenticationError | ValidationError<SelfDestructPostBody> | {
    error: 'Unknown_Error' | 'Invalid_Code' | 'Invalid_Gadget_Id' | 'Gadget_Already_Destroyed',
    errorMessage: string,
    details?: unknown,
}
