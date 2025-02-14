import { type RequestHandler } from 'express';
import { type AppDependencies } from '@/types/app-DI';
import { LogoutPostSuccessResponse } from '@/types/api/auth/logout';

export const logoutPostHandler = (di: AppDependencies): RequestHandler => 
    (req, res) => {
        res
            .clearCookie('AccessToken', { httpOnly: true })
            .clearCookie('RefreshToken', { httpOnly: true })
            .send({
                message: 'Logout successful'
            } satisfies LogoutPostSuccessResponse);
    }
