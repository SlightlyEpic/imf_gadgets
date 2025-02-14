export type AccessToken = {
    iss: string,
    iat: number,
    exp: number,
    sub: string,
    email: string,
    type: 'access',
};

export type RefreshToken = {
    iss: string,
    iat: number,
    exp: number,
    sub: string,
    email: string,
    type: 'refresh',
}
