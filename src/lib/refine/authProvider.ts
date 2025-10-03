"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabase } from "@/lib/supabase";

interface LoginParams {
  email?: string;
  password?: string;
  redirectTo?: string;
}

export const authProvider: AuthProvider = {
  // Login par lien magique (ou email+password si tu fournis password)
  login: async (params: LoginParams) => {
    const { email, password, redirectTo } = params ?? {};
    console.log('Tentative de connexion:', { email, password: '***' });
    try {
      if (password && email) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          console.log('Résultat Supabase:', { data, error });
      
          if (error) {
            console.error('Erreur de connexion:', error);
            return { success: false, error: new Error(error.message) };
          }
        
        // Vérifier si l'utilisateur est admin
        if (data.user) {
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', data.user.id)
            .single();
          
          if (adminError || !adminData) {
            await supabase.auth.signOut();
            return { 
              success: false, 
              error: new Error("Accès non autorisé. Vous n'êtes pas administrateur.") 
            };
          }
        }
        
        return { success: true, redirectTo: redirectTo ?? "/admin" };
      }
      
      if (email) {
        const emailRedirectTo = `${window.location.origin}/admin/auth/callback`;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo },
        });
        if (error) return { success: false, error: new Error(error.message) };
        return {
          success: true,
          successNotification: { message: "Lien envoyé. Vérifiez votre boîte mail." },
        };
      }
      return { success: false, error: new Error("Email requis") };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Erreur de connexion inconnue";
      return { success: false, error: new Error(errorMessage) };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    return { success: true, redirectTo: "/admin/login" };
  },

  // Vérification renforcée avec contrôle admin
  check: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      const isAuthRoute = p.startsWith("/admin/login") || p.startsWith("/admin/auth");
      
      if (!session) {
        if (isAuthRoute) return { authenticated: false };
        return { authenticated: false, redirectTo: "/admin/login" };
      }
      
      // Si on a une session, vérifier si l'utilisateur est admin
      try {
        const { data: adminData, error } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', session.user.id)
          .single();
        
        if (error || !adminData) {
          await supabase.auth.signOut();
          return { authenticated: false, redirectTo: "/admin/login" };
        }
        
        return { authenticated: true };
      } catch (error) {
        await supabase.auth.signOut();
        return { authenticated: false, redirectTo: "/admin/login" };
      }
    }
    
    return session ? { authenticated: true } : { authenticated: false, redirectTo: "/admin/login" };
  },

  onError: async (error: Error) => ({ error, redirectTo: "/admin/login" }),

  getIdentity: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, name: user.email ?? "" };
  },

  getPermissions: async () => null,
};