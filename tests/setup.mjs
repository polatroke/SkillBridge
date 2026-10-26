// Registra o resolvedor que deixa o Node (com remoção de tipos nativa) importar os .ts de src/,
// que usam imports sem extensão no estilo do Vite ("../lib/date" → "../lib/date.ts").
import { register } from 'node:module'

register('./resolve-ts.mjs', import.meta.url)
