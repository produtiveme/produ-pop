# Produ POP

Aplicação para modelagem, revisão e publicação de processos operacionais com editor visual de fluxo.

## Estado atual

Esta base foi reiniciada do zero.

Primeira entrega já implementada:

- landing page do produto
- catálogo de processos com dados mockados
- editor visual com React Flow
- modelagem inicial do domínio em `Prisma`
- projeto conectado ao repositório `https://github.com/produtiveme/produ-pop`

## Stack

- Next.js 16
- React 19
- TypeScript
- Prisma
- Supabase Postgres
- React Flow
- Zod

## Rodando localmente

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Ajuste o `DATABASE_URL` com a senha real do seu banco Supabase.

4. Inicie a aplicação:

```bash
npm run dev
```

## Estrutura inicial

- `src/app/page.tsx`: visão inicial do produto
- `src/app/processos/page.tsx`: lista de processos
- `src/app/processos/[id]/editor/page.tsx`: editor visual
- `src/components/process-editor.tsx`: canvas e painel lateral
- `src/lib/workflow.ts`: tipos, schema e mocks do domínio
- `prisma/schema.prisma`: modelagem inicial para persistência

## Próximo passo recomendado

Conectar a listagem e o editor ao banco real via Prisma, removendo os mocks de `src/lib/workflow.ts`.
