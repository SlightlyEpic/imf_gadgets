import { type PostgresError } from 'postgres';
import z from 'zod';

// Example error:
// {
//     "name": "PostgresError",
//     "severity_local": "ERROR",
//     "severity": "ERROR",
//     "code": "23505",
//     "detail": "Key (email)=(abcd@gmail.com) already exists.",
//     "schema_name": "public",
//     "table_name": "users",
//     "constraint_name": "users_email_unique",
//     "file": "nbtinsert.c",
//     "line": "664",
//     "routine": "_bt_check_unique"
// }

// https://hackage.haskell.org/package/postgresql-error-codes-1.0.1/docs/PostgreSQL-ErrorCodes.html
export const isFKeyViolation = (err: PostgresError) => err.code === '23503';
export const isUniqueViolation = (err: PostgresError) => err.code === '23505';
export const isCheckViolation = (err: PostgresError) => err.code === '23514';

// Encapsulate driver errors into a consistent format for easier error handling
export type QueryErrorType = 'Integrity_Violation' | 'Unique_Violation' | 'Check_Violation' | 'Unknown_Error' | 'No_Match_Error';
export class QueryError {
    type: QueryErrorType;
    message: string;
    cause?: unknown

    constructor(args: { type: QueryErrorType, message: string, cause?: unknown }) {
        this.type = args.type;
        this.message = args.message;
        this.cause = args.cause;
    }
}

export function isUUID(s: string): boolean {
    return !z.string().uuid().safeParse(s).error;
    
}
