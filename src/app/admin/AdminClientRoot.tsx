"use client";

import dynamic from "next/dynamic";

// Rendu uniquement côté navigateur : Refine/antd n'ont pas besoin de SSR ici
// (zone privée) et on évite ainsi tout souci d'hydratation des styles antd.
const AdminProviders = dynamic(() => import("./AdminProviders"), { ssr: false });

export default function AdminClientRoot({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
