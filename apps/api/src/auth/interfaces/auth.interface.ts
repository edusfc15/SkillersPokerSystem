export interface JwtPayload {
  sub: string; // user id
  username: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  emailConfirmed: boolean;
  lockoutEnd?: Date;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}
