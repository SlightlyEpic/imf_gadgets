import z from 'zod';

export const envSchema = z.object({
    POSTGRES_HOST: z.string().min(1),
    POSTGRES_PORT: z.string().min(1),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DATABASE: z.string().min(1),
    PORT: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;
