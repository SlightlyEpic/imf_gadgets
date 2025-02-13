import { createNewUser } from './create-new-user';
import { getUserByEmail } from './get-user-by-email';
import { getUser } from './get-user';
import { addRefreshToken } from './add-refresh-token';

export const auth = {
    addRefreshToken,
    createNewUser,
    getUserByEmail,
    getUser,
};
