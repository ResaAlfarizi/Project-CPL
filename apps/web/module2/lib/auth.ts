import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  id: number;
  role: string;
  iat: number;
  exp: number;
}

export const TOKEN_KEY = 'auth_token';

export const authStorage = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  decodeToken: (token: string): DecodedToken | null => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  isTokenValid: (token: string): boolean => {
    const decoded = authStorage.decodeToken(token);
    if (!decoded) return false;

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  },

  getCurrentUser: (): DecodedToken | null => {
    const token = authStorage.getToken();
    if (!token) return null;

    if (!authStorage.isTokenValid(token)) {
      authStorage.removeToken();
      return null;
    }

    return authStorage.decodeToken(token);
  },
};
