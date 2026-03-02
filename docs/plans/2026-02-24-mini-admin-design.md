# Mini Admin — Design

**Data:** 24/02/2026
**Status:** Aprovado, aguardando implementação

---

## Contexto

O primeiro cliente (Leandro Nunes / Top Chairs) já respondeu o formulário de sponsor. O time precisa de uma forma simples de visualizar as respostas sem precisar acessar o banco diretamente. O objetivo é uma área administrativa mínima — só leitura, sem edição, sem funcionalidades extras por enquanto.

---

## Rotas

```
/admin                  → Login (Google OAuth)
/admin/sponsors         → Lista de todos os sponsors
/admin/sponsors/[id]    → Detalhe com abas (respostas + pessoas-chave)
```

---

## Autenticação

- **Provider:** Google OAuth via Supabase Auth
- **Pacote:** `@supabase/ssr` (suporte nativo ao Next.js App Router)
- **Controle de acesso:** qualquer email com domínio `@daltonlab.ai` tem acesso automático
- **Regra no middleware:**
  ```ts
  if (!session.user.email.endsWith('@daltonlab.ai')) {
    // logout + redirect para /admin?error=unauthorized
  }
  ```
- **Sem gestão manual de usuários** — quem tem o email do domínio entra; quem sai da empresa perde o acesso junto com o email
- **Variáveis de ambiente necessárias:**
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  ```

O middleware do Next.js protege todas as rotas `/admin/sponsors*`. A rota `/admin` (login) é pública.

---

## Lista de Sponsors (`/admin/sponsors`)

Tabela com as seguintes colunas:

| Empresa | Sponsor | Áreas contratadas | Status | Prazo |
|---|---|---|---|---|
| Top Chairs | Leandro Nunes | SAC, Comercial, Marketing | ✅ Concluído | 26/02 |

**Detalhes:**
- Ordenação padrão: mais recente primeiro (`created_at DESC`)
- Status com badge colorido:
  - `pending` → cinza / "Aguardando"
  - `in_progress` → amarelo / "Em andamento"
  - `completed` → verde / "Concluído"
- Linha inteira clicável → navega para `/admin/sponsors/[id]`
- Sem paginação — lista completa em scroll

---

## Detalhe do Sponsor (`/admin/sponsors/[id]`)

Página única com abas no topo, sem recarregamento de página entre elas.

### Abas

```
[ Visão Geral ] [ Seção 1 ] [ Seção 2 ] [ Seção 3 ] [ Seção 4 ] [ Seção 5 ] [ Pessoas-chave ]
```

Abas sem resposta ficam visíveis com indicador "Não respondido" — sem esconder.

---

### Aba: Visão Geral

Informações do registro do sponsor:

- Nome, empresa, WhatsApp
- Áreas contratadas
- Prazo (`data_limite`)
- Status do formulário + datas (`form_started_at`, `form_completed_at`)
- Briefing pré-preenchido pelo PM:
  - Principais áreas da empresa (`briefing_areas`)
  - Sistemas e ferramentas (`briefing_systems`)
  - Uso atual de IA (`briefing_ai_usage`)

---

### Abas: Seções 1 a 5

Exibição read-only das respostas do cliente, com o mesmo label das perguntas do formulário.

**Seção 1 — Validação Rápida**
- Para cada item (áreas, sistemas, uso de IA): badge "Correto" ou "Precisa de ajuste" + correção se houver

**Seção 2 — O que Funciona Bem**
- Maior fortaleza operacional
- Processo de referência
- Melhoria recente

**Seção 3 — Profundidade Operacional**
- Score de integração (1–5) com label descritivo
- Visibilidade de dados
- Processo não priorizado

**Seção 4 — O Time e a Cultura**
- Abertura para mudança (label da opção selecionada)
- Champion de tecnologia
- Desafios de pessoas (chips/badges das opções marcadas)

**Seção 5 — Expectativas**
- Critério de sucesso
- Preocupações
- Stakeholders-chave

---

### Aba: Pessoas-chave

Duas partes:

**Colaboradores indicados** — tabela:

| Nome | Cargo | Área | WhatsApp |
|---|---|---|---|
| Josiane | Coordenadora | Marketing/Comercial | +55... |

**Preferências de contato:**
- Opção selecionada pelo sponsor
- Observações adicionais (`s6_people_notes`)

---

## O que está fora do escopo (por enquanto)

- Edição de respostas
- Exportação (PDF, CSV)
- Histórico de alterações
- Notificações
- Gestão de usuários admin
- Visualização de respostas de entrevistados (formulários 2 e 3)

---

## Arquivos a criar/modificar

| Arquivo | Ação |
|---|---|
| `src/middleware.ts` | Criar — proteção de rotas + verificação de domínio |
| `src/lib/supabase/server.ts` | Criar — client Supabase SSR (server) |
| `src/lib/supabase/client.ts` | Criar — client Supabase SSR (browser) |
| `src/app/admin/page.tsx` | Criar — página de login |
| `src/app/admin/sponsors/page.tsx` | Criar — tabela de sponsors |
| `src/app/admin/sponsors/[id]/page.tsx` | Criar — detalhe com abas |
| `.env` | Atualizar — adicionar variáveis do Supabase Auth |
