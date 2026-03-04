/**
 * Token management utilities
 */

import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  id: string;
  name: string;
  email: string;
  request?: string; // Enterprise ID
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decode JWT token
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
}

/**
 * Check if token is valid (not expired)
 */
export function isTokenValid(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
}
