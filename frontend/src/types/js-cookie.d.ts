// src/types/js-cookie.d.ts
declare module "js-cookie" {
  export type SameSite = "strict" | "lax" | "none";

  export interface CookieAttributes {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: SameSite;
  }

  type RemovableAttrs = Pick<CookieAttributes, "path" | "domain">;

  const Cookies: {
    get(name: string): string | undefined;
    get(): Record<string, string>;
    set(name: string, value: string, options?: CookieAttributes): void;
    set(
      name: string,
      value: Record<string, unknown>,
      options?: CookieAttributes
    ): void;
    remove(name: string, options?: RemovableAttrs): void;
  };

  export default Cookies;
}
