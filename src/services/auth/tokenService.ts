import { jwtDecode } from "jwt-decode";
import { AUTH_COOKIE_NAMES, getCookie } from "../../utils/cookies";

export interface TokenPayload {
  sub?: string;
  name?: string;
  email?: string;
  role?: string | string[];
  permission?: string | string[];
  permissions?: string | string[];
  [claim: string]: unknown;
  exp?: number;
  iat?: number;
}

const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_IDENTIFIER_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

export function getTokenPayload(): TokenPayload | null {
  const accessToken = getCookie(AUTH_COOKIE_NAMES.accessToken);

  if (!accessToken) {
    return null;
  }

  try {
    return jwtDecode<TokenPayload>(accessToken);
  } catch {
    return null;
  }
}

export function getTokenRole(
  payload: TokenPayload | null = getTokenPayload(),
): string | null {
  const role = payload?.role ?? payload?.[ROLE_CLAIM];

  if (typeof role === "string") {
    return role;
  }

  if (Array.isArray(role) && typeof role[0] === "string") {
    return role[0];
  }

  const storedRole = localStorage.getItem("userRole");
  if (storedRole) {
    return storedRole;
  }

  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser) as { role?: unknown };
    return typeof user.role === "string" ? user.role : null;
  } catch {
    return null;
  }
}

export function getTokenSubject(
  payload: TokenPayload | null = getTokenPayload(),
): string | null {
  const subject = payload?.sub ?? payload?.[NAME_IDENTIFIER_CLAIM];
  return typeof subject === "string" ? subject : null;
}