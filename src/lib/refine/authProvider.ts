"use client";

import { AuthBindings } from "@refinedev/core";
import { supabase } from "@/lib/supabase";

export const authProvider: AuthBindings = {
  // Login par lien magique (ou email+password si tu fournis password)
  login: async (params: any) => {
    const { email, password, redirectTo } = params ?? {};
    console.log('Tentative de connexion:', { email, password: '***' });
    try {
      if (password && email) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          console.log('Résultat Supabase:', { data, error });
      
          if (error) {
            console.error('Erreur de connexion:', error);
            return { success: false, error };
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
        if (error) return { success: false, error };
        return {
          success: true,
          successNotification: { message: "Lien envoyé. Vérifiez votre boîte mail." },
        };
      }
      return { success: false, error: new Error("Email requis") };
    } catch (e: any) {
      return { success: false, error: e };
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

  onError: async (error) => ({ error, redirectTo: "/admin/login" }),

  getIdentity: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, name: user.email ?? "" };
  },

  getPermissions: async () => null,
};