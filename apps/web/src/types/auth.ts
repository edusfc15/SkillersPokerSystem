// Types baseados na API
export interface LoginDto {
  emailOrUsername: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  emailConfirmed?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}
