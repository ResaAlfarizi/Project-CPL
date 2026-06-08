import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  name?: string;
  nama?: string;
  entity_id?: string;
  entity_type?: string;
  prodi_id?: string;
  iat: number;
  exp: number;
}

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const authStorage = {
  // Get access token from localStorage
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  // Set access token to localStorage
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    
    // Also set cookie for middleware
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  },

  // Get refresh token from localStorage
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Set refresh token to localStorage
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  // Remove all tokens
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    
    // Remove cookie
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },

  // Decode JWT token
  decodeToken: (token: string): DecodedToken | null => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  },

  // Get current user from token
  getCurrentUser: (): DecodedToken | null => {
    const token = authStorage.getToken();
    if (!token) return null;
    
    if (authStorage.isTokenExpired(token)) {
      authStorage.removeToken();
      return null;
    }
    
    return authStorage.decodeToken(token);
  },

  // Validate token
  validateToken: (): boolean => {
    const token = authStorage.getToken();
    if (!token) return false;
    return !authStorage.isTokenExpired(token);
  }
};
