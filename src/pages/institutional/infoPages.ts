/** Páginas institucionais do rodapé (cada slug vira a rota /slug). */
export const INFO_PAGES = ['precos', 'sobre', 'carreiras', 'imprensa', 'parceiros', 'ajuda', 'contato', 'termos', 'privacidade'] as const
export type InfoSlug = (typeof INFO_PAGES)[number]
