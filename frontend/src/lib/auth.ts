// src/lib/auth.ts
import { useApp } from "@/store/app";
import type { User } from "@/types/api";

const TOKEN_COOKIE = "ps_token";
const ROLE_COOKIE = "ps_role";
const Name_COOKIE = "ps_name";

export function setSession(token: string, user?: User, maxAgeDays = 1) {
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  if (user?.role) {
    document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(
      user.role
    )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
  if (user?.name) {
    document.cookie = `${Name_COOKIE}=${encodeURIComponent(
      user.name
    )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
  try {
    useApp.getState().setAuth({ token, user });
  } catch {}
}

export function clearSession() {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${Name_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  try {
    useApp.getState().logout();
  } catch {}
}
const isClient = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";

export function getCookie(name: string): string | undefined {
  if (!isClient()) return undefined;
  const parts = document.cookie.split("; ").filter(Boolean);
  for (const part of parts) {
    const [k, ...rest] = part.split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function getToken(): string | undefined {
  return getCookie(TOKEN_COOKIE);
}
export function getRole(): string | undefined {
  return getCookie(ROLE_COOKIE);
}
export function getName(): string | undefined {
  return getCookie(Name_COOKIE);
}