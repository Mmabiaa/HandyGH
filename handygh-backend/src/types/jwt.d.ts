interface JwtPayload {
  userId: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  userId: string;
  token: string;
  exp: number;
}