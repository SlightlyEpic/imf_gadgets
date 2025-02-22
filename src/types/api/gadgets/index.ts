import z from 'zod';
import * as schema from '@/database/schema';
import { gadgetStatus } from '@/database/schema/gadgets.sql';
import { AuthenticationError, ValidationError } from '../errors';

export type GadgetsGetSuccessResponse = {
    message: string,
    gadgets: Array<typeof schema.gadgets.$inferSelect & {
        missionSuccessProbability: number,
    }>,
};

export type GadgetsGetErrorResponse = AuthenticationError;

export type GadgetsPostSuccessResponse = {
    message: string,
    gadget: typeof schema.gadgets.$inferSelect,
};

export type GadgetsPostErrorResponse = AuthenticationError | {
    error: 'Unknown_Error' | 'Invalid_User_Id',
    errorMessage: string,
    details?: unknown,
};

export const gadgetsPatchSchema = z.object({
    id: z.string().uuid(),
    name: z.optional(z.string().min(1).max(128)),
    status: z.optional(z.enum(gadgetStatus.enumValues)),
});

export type GadgetsPatchBody = z.infer<typeof gadgetsPatchSchema>;

export type GadgetsPatchSuccessResponse = {
    message: string,
    gadget: typeof schema.gadgets.$inferSelect,
}

export type GadgetsPatchErrorResponse = AuthenticationError | ValidationError<GadgetsPatchBody> | {
    error: 'Unknown_Error' | 'Duplicate_Name' | 'Invalid_Gadget_Id',
    errorMessage: string,
    details?: unknown,
}

export type GadgetsDeleteSuccessResponse = {
    message: string,
}

export type GadgetsDeleteErrorResponse = AuthenticationError | {
    error: 'Unknown_Error' | 'Invalid_Gadget_Id' | 'Gadget_Already_Decommissioned',
    errorMessage: string,
    details?: unknown,
}
