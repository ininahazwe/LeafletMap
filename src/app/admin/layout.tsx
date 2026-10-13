import type { Metadata } from "next";
import AdminClientRoot from "./AdminClientRoot";

export const metadata: Metadata = {
  title: "Mediascape Admin",
  robots: { index: false, follow: false, nocache: true },
};

// Le back-office couvre tout l'écran (par-dessus la grille décorative du site public).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        overflow: "auto",
        background: "#f5f5f5",
      }}
    >
      <AdminClientRoot>{children}</AdminClientRoot>
    </div>
  );
}
