# SkillBridge

Plataforma de upskilling com três painéis — **Aluno**, **Mentor** e **Empresa** — em React 19 + Vite + Tailwind 3,
com autenticação e banco no Supabase (Postgres + RLS).

## Rodando localmente

1. Crie um arquivo `.env` na raiz com as chaves públicas do projeto Supabase:

   ```
   VITE_SUPABASE_URL=https://<projeto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<chave anon/publishable>
   ```

2. Instale e rode:

   ```bash
   npm install
   npm run dev
   ```

## Scripts

| Comando         | O que faz                                                                  |
| --------------- | -------------------------------------------------------------------------- |
| `npm run dev`   | Servidor de desenvolvimento do Vite                                        |
| `npm run build` | Checagem de tipos (`tsc -b`) + build de produção em `dist/`                |
| `npm run lint`  | Oxlint                                                                     |
| `npm test`      | Testes unitários das regras de negócio (`tests/`, test runner nativo do Node 24) |

## Estrutura

- `src/pages/{institutional,auth,student,mentor,company}` — telas, uma por rota (carregadas sob demanda).
- `src/store/authStore.ts` — sessão do Supabase Auth e tipo de conta logada.
- `src/store/dataStore.ts` — dados do painel (carga inicial + recarga após cada ação).
- `src/lib/supabase/` — consultas, RPCs e cadastro; `src/lib/` — regras puras (acesso, progresso, validação).
- O controle de acesso de verdade é feito pelas políticas RLS e funções do banco; as regras em `src/lib/access.ts`
  só espelham essas políticas na interface.
