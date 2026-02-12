# Phase 2 - Formulário do Sponsor

## Objetivo

Criar o formulário onde o sponsor (cliente) cadastra os dados da empresa e a lista de entrevistados que participarão do Diagnóstico 360. Este formulário é o ponto de entrada do sistema — sem ele, não existem entrevistados no banco.

## Contexto

- O sponsor recebe o link `/sponsor` (possivelmente com query params pré-preenchidos)
- Ele preenche dados da empresa e cadastra no mínimo 3 entrevistados
- Ao submeter, o sistema cria o registro do sponsor e todos os entrevistados no banco
- Cada entrevistado recebe um UUID que será usado no link do formulário de diagnóstico

## Arquivos a Criar

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/sponsor/page.tsx` | Página do formulário do sponsor |
| `src/app/api/sponsors/route.ts` | API POST para criação do sponsor + entrevistados |
| `src/components/forms/SponsorForm.tsx` | Componente do formulário (client component) |

## Arquivos Compartilhados (já existem, não modificar)

| Arquivo | O que contém |
|---------|-------------|
| `src/lib/prisma.ts` | Instância singleton do Prisma Client |
| `src/lib/validations.ts` | Schemas Zod (`sponsorFormSchema`, `SponsorFormData`) |
| `src/types/index.ts` | Tipos TypeScript (`EntrevistadoInput`, etc.) |

## Stack e Convenções

- Next.js App Router com TypeScript
- Tailwind CSS puro (sem component library)
- Validação client-side e server-side com Zod
- Prisma Client importado de `@/lib/prisma`
- Types importados de `@/types`
- Validações importadas de `@/lib/validations`

## Campos do Formulário

### Dados do Sponsor (podem vir pré-preenchidos via query params)

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `empresa` | string | Sim | Nome da empresa |
| `nome_sponsor` | string | Sim | Nome do sponsor |
| `whatsapp_sponsor` | string | Sim | Formato: +55XXXXXXXXXXX |
| `areas_contratadas` | string[] | Sim | Mínimo 1 área |
| `data_limite` | date | Sim | Data limite pra conclusão |

### Lista de Entrevistados (array dinâmico, mínimo 3)

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `nome` | string | Sim |
| `cargo` | string | Sim |
| `area` | string | Sim |
| `whatsapp` | string | Sim, formato +55XXXXXXXXXXX |

### Pergunta Final

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `avisou_time` | boolean | Sim |

Texto: "Você já avisou o time que eles receberão mensagem do Dalton?"

## Regras de Validação

Todas as validações já estão definidas em `src/lib/validations.ts` (`sponsorFormSchema`):

1. **Mínimo 3 entrevistados** na lista
2. **WhatsApps únicos** — não pode ter dois entrevistados com o mesmo número
3. **Formato de WhatsApp** — deve seguir regex `^\+55\d{10,11}$`
4. **Todos os campos obrigatórios** preenchidos
5. Validação em tempo real conforme o usuário digita

## Comportamento da Lista Dinâmica

- Começa com 3 blocos de entrevistado (mínimo)
- Botão **"+ Adicionar outro entrevistado"** adiciona novo bloco
- Botão **"Remover"** em cada bloco, mas desabilitado quando restam apenas 3
- Validação de duplicidade de WhatsApp em tempo real (highlight no campo se repetido)

## API POST `/api/sponsors`

### Input
Body JSON com todos os campos do formulário, validado pelo `sponsorFormSchema`.

### Comportamento
1. Validar body com `sponsorFormSchema.parse(body)`
2. Criar sponsor no banco via Prisma
3. Criar todos os entrevistados vinculados ao sponsor (nested create)
4. Cada entrevistado começa com `status: "nao_iniciado"`, `secao_atual: 1`, `respostas: {}`

### Output - Sucesso (200)
```json
{ "success": true, "sponsor": { ...sponsorComEntrevistados } }
```

### Output - Erro de Validação (400)
```json
{ "success": false, "errors": [...zodErrors] }
```

### Output - Erro Interno (500)
```json
{ "success": false, "error": "Erro ao criar sponsor" }
```

## Fluxo de Sucesso (pós-submit)

Após submit bem-sucedido, mostrar tela de confirmação com:
- Mensagem de sucesso ("Entrevistados cadastrados com sucesso!")
- Resumo: quantidade de entrevistados cadastrados
- Lista dos nomes cadastrados
- Informação de que eles receberão o link via WhatsApp

## UX e Acessibilidade

- Botão "Enviar" desabilitado até todas as validações passarem
- Loading state no botão durante o submit
- Feedback visual de erro por campo (mensagem em vermelho abaixo do campo)
- Layout responsivo (mobile-first, muitos sponsors usarão no celular)
- Labels claros em cada campo
