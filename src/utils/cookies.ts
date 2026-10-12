export const AUTH_COOKIE_NAMES = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
} as const;

export function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") {
    return;
  }

  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  if (!cookieValue) {
    return null;
  }

  return decodeURIComponent(cookieValue.split("=").slice(1).join("="));
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}
