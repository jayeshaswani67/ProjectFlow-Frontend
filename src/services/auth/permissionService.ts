import {
  getTokenPayload,
  getTokenRole,
  getTokenSubject,
} from "./tokenService";

export function getCurrentRole(): string | null {
  return getTokenRole();
}

export function getCurrentUserId(): string | null {
  return getTokenSubject();
}

export function getCurrentUserEmail(): string | null {
  return getTokenPayload()?.email ?? null;
}

export function getCurrentUserName(): string | null {
  return getTokenPayload()?.name ?? null;
}

export function getCurrentPermissions(): string[] {
  const payload = getTokenPayload();
  const tokenPermissions =
    payload?.permission ??
    payload?.permissions ??
    payload?.[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/permission"
    ];
  const permissions = normalizePermissions(tokenPermissions);

  if (permissions.length > 0) {
    return permissions;
  }

  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    return [];
  }

  try {
    const user = JSON.parse(storedUser) as {
      permissions?: unknown;
    };
    return normalizePermissions(user.permissions);
  } catch {
    return [];
  }
}

export function can(permission: string): boolean {
  return getCurrentPermissions().includes(permission);
}

function normalizePermissions(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter(
      (permission): permission is string =>
        typeof permission === "string",
    );
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .filter(([, enabled]) => enabled === true)
      .map(([permission]) => permission);
  }

  return [];
}