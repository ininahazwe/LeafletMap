"use client";

import type { AuthProvider } from "@refinedev/core";

interface LoginParams {
  email?: string;
  password?: string;
  redirectTo?: string;
}

const AUTH_ROUTES = [
  "/admin/login",
  "/admin/auth",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export const authProvider: AuthProvider = {
  login: async (params: LoginParams) => {
    const { email, password, redirectTo } = params ?? {};

    if (!email || !password) {
      return {
        success: false,
        error: new Error("Email and password required"),
      };
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: new Error(data.error ?? "Login error"),
        };
      }

      return {
        success: true,
        redirectTo: redirectTo ?? "/admin/countries",
      };
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Unknown login error";
      return { success: false, error: new Error(errorMessage) };
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      return { success: true, redirectTo: "/admin/login" };
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Logout error";
      return { success: false, error: new Error(errorMessage) };
    }
  },

  check: async () => {
    try {
      const res = await fetch("/api/auth/me");

      const isAuthRoute =
        typeof window !== "undefined" &&
        AUTH_ROUTES.some((p) => window.location.pathname.startsWith(p));

      if (!res.ok) {
        if (isAuthRoute) {
          return { authenticated: false };
        }
        return { authenticated: false, redirectTo: "/admin/login" };
      }

      return { authenticated: true };
    } catch (error) {
      console.error("Check error:", error);
      return {
        authenticated: false,
        redirectTo: "/admin/login",
        error:
          error instanceof Error
            ? error
            : new Error("Authentication error"),
      };
    }
  },

  onError: async (error: Error) => {
    console.error("Auth error:", error);
    return { error, logout: true, redirectTo: "/admin/login" };
  },

  getIdentity: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;

      const { user } = await res.json();
      if (!user) return null;

      return {
        id: user.id,
        name: user.name ?? user.email ?? "",
        email: user.email ?? "",
      };
    } catch (error) {
      console.error("getIdentity error:", error);
      return null;
    }
  },

  getPermissions: async () => null,
};
