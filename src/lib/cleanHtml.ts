// lib/cleanHtml.ts
// Nettoie le HTML produit par l'éditeur WYSIWYG (TinyMCE) avant affichage :
// paragraphes/spans vides, &nbsp; isolés, styles inline, attributs Word/Office.
export function cleanHtml(html: string | null | undefined): string {
  if (!html) return "";

  return html
    // paragraphes/divs/spans vides ou ne contenant que &nbsp; / espaces / <br>
    .replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/<div[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/div>/gi, "")
    .replace(/<span[^>]*>(\s|&nbsp;)*<\/span>/gi, "")
    // styles inline (couleurs/polices imposées par le copier-coller Word/TinyMCE)
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/\sclass="[^"]*"/gi, "")
    // balises de méta Word résiduelles
    .replace(/<o:p[^>]*>.*?<\/o:p>/gi, "")
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
    // &nbsp; isolés restants -> espace normal
    .replace(/&nbsp;/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
