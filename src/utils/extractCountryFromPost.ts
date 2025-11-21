// utils/extractCountryFromPost.ts

interface WordPressPost {
    title: { rendered: string };
    excerpt: { rendered: string };
    link: string;
    date: string;
    slug?: string;
    tags?: number[];
    categories?: number[];
    acf?: Record<string, unknown>;
    meta?: Record<string, unknown>;
    _embedded?: {
        'wp:term'?: Array<Array<{
            name: string;
            slug: string;
            taxonomy: string;
        }>>;
    };
}

// Mapping des noms de pays vers ISO3
const COUNTRY_NAME_TO_ISO3: Record<string, string> = {
    'senegal': 'SEN',
    'mali': 'MLI',
    'nigeria': 'NGA',
    'ghana': 'GHA',
    'burkina-faso': 'BFA',
    'guinea': 'GIN',
    'benin': 'BEN',
    'togo': 'TGO',
    'niger': 'NER',
    'ivory-coast': 'CIV',
    'cote-divoire': 'CIV',
    'gambia': 'GMB',
    'sierra-leone': 'SLE',
    'liberia': 'LBR',
    'guinea-bissau': 'GNB',
    'mauritania': 'MRT',
    'cape-verde': 'CPV',
    // Ajoute tous les pays d'Afrique de l'Ouest
};

export function extractCountryISO3(post: WordPressPost): string | null {
    // 1. Chercher dans les tags embedded
    if (post._embedded?.['wp:term']) {
        for (const termGroup of post._embedded['wp:term']) {
            for (const term of termGroup) {
                const slug = term.slug.toLowerCase();
                if (COUNTRY_NAME_TO_ISO3[slug]) {
                    return COUNTRY_NAME_TO_ISO3[slug];
                }
            }
        }
    }

    // 2. Chercher dans le slug du post (ex: "senegal-journalist-arrested")
    if (post.slug) {
        const slugParts = post.slug.toLowerCase().split('-');
        for (const part of slugParts) {
            if (COUNTRY_NAME_TO_ISO3[part]) {
                return COUNTRY_NAME_TO_ISO3[part];
            }
        }
    }

    // 3. Chercher dans le titre
    const title = post.title.rendered.toLowerCase();
    for (const [countryName, iso3] of Object.entries(COUNTRY_NAME_TO_ISO3)) {
        if (title.includes(countryName)) {
            return iso3;
        }
    }

    return null; // Pas de pays trouvé
}