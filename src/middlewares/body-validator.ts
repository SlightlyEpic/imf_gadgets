import { type RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '@/types/api/errors';

export const validateBody = <T>(schema: ZodSchema<T>): RequestHandler =>
    (req, res, next) => {
        const parseResult = schema.safeParse(req.body);
        if(parseResult.error) {
            res.status(400).send({
                error: 'Validation_Error',
                errorMessage: 'Request body validation failed',
                details: parseResult.error,
            } satisfies ValidationError<T>)
        }

        next();
    }
