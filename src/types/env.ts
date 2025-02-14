import z from 'zod';

export const envSchema = z.object({
    POSTGRES_HOST: z.string().min(1),
    POSTGRES_PORT: z.string().min(1),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DATABASE: z.string().min(1),
    PORT: z.string().min(1),
    JWT_SIGNING_SECRET: z.string().min(1),
    VERBOSE: z.enum(['0', '1', '2']).transform(v => Number(v) as (1 | 2 | 3))
});

export type Env = z.infer<typeof envSchema>;
