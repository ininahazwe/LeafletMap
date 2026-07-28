// lib/slug.ts — Slug d'URL basé sur le nom anglais du pays (ex: "Guinea-Bissau" -> "guinea-bissau")
const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

export function slugifyCountryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
