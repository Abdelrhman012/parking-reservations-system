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
