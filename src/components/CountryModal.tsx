// components/CountryModal.tsx — Chrome du panneau latéral (backdrop + drawer).
// Ouverture/fermeture en transition CSS pure (fiable, aucune dépendance au
// timing des refs/effects) ; GSAP reste utilisé à l'intérieur du contenu
// (scrollspy, scroll-to-ancre, apparition des cartes d'alertes).
// Le contenu vit dans CountryDetailContent, réutilisé aussi par /country/[slug].
"use client";

import React, { useEffect, useState } from "react";
import CountryDetailContent from "@/components/country/CountryDetailContent";

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  iso3: string;
}

export default function CountryModal({ isOpen, onClose, iso3 }: CountryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Ouverture : monter puis, une frame plus tard, basculer les classes
  // pour déclencher la transition CSS. Fermeture : inverse, puis démontage
  // après la durée de la transition.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timeout = setTimeout(() => setMounted(false), 400);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  // Verrouille le scroll du body pendant que le panneau est monté
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  // ESC pour fermer
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9999] bg-black/30 transition-opacity duration-300 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panneau latéral — pleine largeur, layout identique à la page /country/[slug].
          CountryDetailContent gère son propre scroll interne (h-full overflow-y-auto). */}
      <div
        className={`fixed inset-y-0 right-0 z-[10000] w-full bg-white shadow-2xl transition-transform duration-500 ease-out overflow-hidden ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <CountryDetailContent iso3={iso3} embedded onClose={onClose} />
      </div>
    </>
  );
}
