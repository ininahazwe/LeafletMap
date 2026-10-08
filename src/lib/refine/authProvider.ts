"use client";

import type { AuthProvider } from "@refinedev/core";
import { api, ApiError } from "@/lib/api";

interface LoginParams {
  email?: string;
  password?: string;
  redirectTo?: string;
}

interface MeResponse {
  authenticated: boolean;
  user: { id: number; email: string; name: string | null } | null;
}

// Remplace Supabase Auth : login/logout/session gérés par l'API PHP
// (/backend/api/auth/*.php) via un cookie JWT httpOnly. Le contrôle
// "admin" est implicite : seules les lignes de la table admin_users
// permettent de se connecter (plus besoin de vérifier une table
// admins séparée côté client).
export const authProvider: AuthProvider = {
  login: async (params: LoginParams) => {
    const { email, password, redirectTo } = params ?? {};

    if (!email || !password) {
      return { success: false, error: new Error("Email et mot de passe requis") };
    }

    try {
      await api.post("/auth/login.php", { email, password });
      return {
        success: true,
        redirectTo: redirectTo ?? "/admin/countries",
      };
    } catch (e: unknown) {
      const message = e instanceof ApiError ? e.message : "Erreur de connexion";
      return { success: false, error: new Error(message) };
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout.php");
      return { success: true, redirectTo: "/admin/login" };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur de déconnexion";
      return { success: false, error: new Error(message) };
    }
  },

  check: async () => {
    try {
      await api.get<MeResponse>("/auth/me.php");
      return { authenticated: true };
    } catch (e: unknown) {
      if (typeof window !== "undefined") {
        const p = window.location.pathname;
        const isAuthRoute =
          p.startsWith("/admin/login") ||
          p.startsWith("/admin/auth") ||
          p.startsWith("/admin/forgot-password") ||
          p.startsWith("/admin/reset-password");

        if (isAuthRoute) {
          return { authenticated: false };
        }
      }
      return {
        authenticated: false,
        redirectTo: "/admin/login",
        error: e instanceof Error ? e : new Error("Non authentifié"),
      };
    }
  },

  onError: async (error: Error) => {
    console.error("Auth error:", error);
    return {
      error,
      logout: true,
      redirectTo: "/admin/login",
    };
  },

  getIdentity: async () => {
    try {
      const res = await api.get<MeResponse>("/auth/me.php");
      if (!res.user) return null;
      return {
        id: res.user.id,
        name: res.user.name ?? res.user.email,
        email: res.user.email,
      };
    } catch {
      return null;
    }
  },

  getPermissions: async () => null,
};
