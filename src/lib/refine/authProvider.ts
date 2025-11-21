"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabase } from "@/lib/supabase";
interface LoginParams {
  email?: string;
  password?: string;
  redirectTo?: string;
}
export const authProvider: AuthProvider = {
  // Login par email+password
  login: async (params: LoginParams) => {
    const { email, password, redirectTo } = params ?? {};
    console.log('Tentative de connexion:', { email, password: '***' });
    
    try {
      if (!email) {
        return { success: false, error: new Error("Email requis") };
      }

      if (password) {
        // Connexion avec mot de passe
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        console.log('Résultat Supabase:', { data, error });
      
        if (error) {
          console.error('Erreur de connexion:', error);
          return { 
            success: false, 
            error: new Error(error.message) 
          };
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
        
        return { 
          success: true, 
          redirectTo: redirectTo ?? "/admin/countries" 
        };
      }
      
      // Connexion par lien magique (OTP)
      const emailRedirectTo = `${window.location.origin}/admin/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo },
      });
      
      if (error) {
        return { 
          success: false, 
          error: new Error(error.message) 
        };
      }
      
      return {
        success: true,
        successNotification: { 
          message: "Lien envoyé. Vérifiez votre boîte mail.",
          type: "success"
        },
      };
      
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Erreur de connexion inconnue";
      console.error('Exception lors de la connexion:', errorMessage);
      return { 
        success: false, 
        error: new Error(errorMessage) 
      };
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { 
          success: false, 
          error: new Error(error.message) 
        };
      }
      return { 
        success: true, 
        redirectTo: "/admin/login" 
      };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Erreur de déconnexion";
      return { 
        success: false, 
        error: new Error(errorMessage) 
      };
    }
  },

  // Vérification renforcée avec contrôle admin
  check: async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erreur session:', sessionError);
        return { 
          authenticated: false, 
          redirectTo: "/admin/login",
          error: new Error(sessionError.message)
        };
      }
      
      if (typeof window !== "undefined") {
        const p = window.location.pathname;
        const isAuthRoute = p.startsWith("/admin/login") || 
                           p.startsWith("/admin/auth") ||
                           p.startsWith("/admin/forgot-password") ||
                           p.startsWith("/admin/reset-password");
        
        if (!session) {
          if (isAuthRoute) {
            return { authenticated: false };
          }
          return { 
            authenticated: false, 
            redirectTo: "/admin/login" 
          };
        }
        
        // Si on a une session, vérifier si l'utilisateur est admin
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', session.user.id)
          .single();
        
        if (adminError || !adminData) {
          console.error('Utilisateur non admin:', adminError);
          await supabase.auth.signOut();
          return { 
            authenticated: false, 
            redirectTo: "/admin/login",
            error: new Error("Accès non autorisé")
          };
        }
        
        return { authenticated: true };
      }
      
      return session 
        ? { authenticated: true } 
        : { authenticated: false, redirectTo: "/admin/login" };
        
    } catch (error) {
      console.error('Erreur check:', error);
      await supabase.auth.signOut();
      return { 
        authenticated: false, 
        redirectTo: "/admin/login",
        error: error instanceof Error ? error : new Error("Erreur d'authentification")
      };
    }
  },

  onError: async (error: Error) => {
    console.error('Auth error:', error);
    return { 
      error, 
      logout: true,
      redirectTo: "/admin/login" 
    };
  },

  getIdentity: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }
      
      return { 
        id: user.id, 
        name: user.email ?? "",
        email: user.email ?? ""
      };
    } catch (error) {
      console.error('Erreur getIdentity:', error);
      return null;
    }
  },

  getPermissions: async () => null,
};