# Design: Formulário 2 — Entrevista com Gestores e Líderes (Versão A)

## Resumo

Implementação do formulário para gestores e líderes (Versão A do documento), com 5 blocos e 9 perguntas principais. O formulário segue o mesmo padrão visual e técnico do formulário existente (DiagnosticoForm), mas com perguntas e estrutura específicas para perfil de gestão.

---

## Estrutura do Formulário

### Blocos e Perguntas

| Bloco | Pergunta | Tipo | Validação especial |
|-------|----------|------|-------------------|
| 1. Visão da Área | 1. Visão geral do time | Aberta + áudio | Mínimo 30 palavras |
| 1. Visão da Área | 2. Interdependências | Aberta + áudio | — |
| 2. Desafios de Gestão | 3. Principal problema | Aberta + áudio | Aprofundamento se genérico |
| 2. Desafios de Gestão | 4. Impacto prático | Aberta + áudio | — |
| 2. Desafios de Gestão | 5. Atividade repetitiva | Aberta + áudio | — |
| 3. Ferramentas | 6. Sistemas e ferramentas | Aberta + áudio | — |
| 3. Ferramentas | 6.1. Integração (condicional) | Aberta + áudio | Aparece se múltiplos sistemas |
| 3. Ferramentas | 6.2. Tempo em planilhas (condicional) | Aberta + áudio | Aparece se mencionar planilhas |
| 4. IA e Inovação | 7. Uso de IA na equipe | Aberta + áudio | — |
| 5. Metas e Cenário Ideal | 8. Metas do semestre | Aberta + áudio | — |
| 5. Metas e Cenário Ideal | 9. Assistente perfeito | Aberta + áudio | — |

---

## Arquitetura

### 1. Banco de Dados (Prisma)

Adicionar campo `tipo` na tabela `entrevistados`:

```prisma
model Entrevistado {
  id            String   @id @default(uuid())
  nome          String
  email         String?
  cargo         String
  area          String
  whatsapp      String
  status        String   // "nao_iniciado" | "em_andamento" | "concluido"
  tipo          String   // NOVO: "gestor" | "operador"
  respostas     Json?    // Respostas do formulário
  sponsor_id    String
  sponsor       Sponsor  @relation(fields: [sponsor_id], references: [id])
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}
```

**Migration:**
```sql
ALTER TABLE "entrevistados" ADD COLUMN "tipo" TEXT NOT NULL DEFAULT 'gestor';
```

> Nota: O default 'gestor' é temporário para migração. Futuramente todos devem ter tipo explícito.

---

### 2. Tipos TypeScript

Novos tipos em `src/types/index.ts`:

```typescript
export type TipoEntrevistado = "gestor" | "operador";

export interface Entrevistado {
  id: string;
  nome: string;
  email?: string;
  cargo: string;
  area: string;
  whatsapp: string;
  status: StatusEntrevistado;
  tipo: TipoEntrevistado;  // NOVO
  respostas?: RespostasGestor | RespostasOperador;
  sponsor_id: string;
  created_at: string;
  updated_at: string;
}

// Respostas específicas do formulário de gestores
export interface RespostasGestor {
  // Bloco 1 - Visão da Área
  visao_geral?: string;
  interdependencias?: string;

  // Bloco 2 - Desafios de Gestão
  principal_problema?: string;
  impacto_pratico?: string;
  atividade_repetitiva?: string;

  // Bloco 3 - Ferramentas
  sistemas_ferramentas?: string;
  integracao_sistemas?: string;        // Condicional
  tempo_planilhas?: string;            // Condicional

  // Bloco 4 - IA e Inovação
  uso_ia_equipe?: string;

  // Bloco 5 - Metas e Cenário Ideal
  metas_semestre?: string;
  assistente_perfeito?: string;
}
```

---

### 3. Schema Zod

Novo schema em `src/lib/validations.ts`:

```typescript
export const respostasGestorSchema = z.object({
  // Bloco 1
  visao_geral: z.string().min(1, "Resposta obrigatória"),
  interdependencias: z.string().min(1, "Resposta obrigatória"),

  // Bloco 2
  principal_problema: z.string().min(1, "Resposta obrigatória"),
  impacto_pratico: z.string().min(1, "Resposta obrigatória"),
  atividade_repetitiva: z.string().min(1, "Resposta obrigatória"),

  // Bloco 3
  sistemas_ferramentas: z.string().min(1, "Resposta obrigatória"),
  integracao_sistemas: z.string().optional(),
  tempo_planilhas: z.string().optional(),

  // Bloco 4
  uso_ia_equipe: z.string().min(1, "Resposta obrigatória"),

  // Bloco 5
  metas_semestre: z.string().min(1, "Resposta obrigatória"),
  assistente_perfeito: z.string().min(1, "Resposta obrigatória"),
});

export type RespostasGestorInput = z.infer<typeof respostasGestorSchema>;
```

---

### 4. Componentes

#### 4.1 Novo componente: `DiagnosticoGestorForm.tsx`

Local: `src/components/forms/DiagnosticoGestorForm.tsx`

**Estrutura:**
- 5 blocos (Step 1 a 5)
- Cada bloco tem 2-3 perguntas
- Perguntas condicionais (6.1, 6.2) aparecem dinamicamente baseado nas respostas
- Usa `FieldWithAudio` para todos os campos (mesmo padrão do Sponsor)
- Validação de mínimo 30 palavras na pergunta 1 (gamificação)

**Blocos:**

```typescript
const blocos = [
  {
    numero: 1,
    titulo: "Visão da Área",
    subtitulo: "Entendendo a estrutura e organização do time",
    campos: ["visao_geral", "interdependencias"]
  },
  {
    numero: 2,
    titulo: "Desafios de Gestão",
    subtitulo: "Pontos de fricção e oportunidades de melhoria",
    campos: ["principal_problema", "impacto_pratico", "atividade_repetitiva"]
  },
  {
    numero: 3,
    titulo: "Ferramentas e Visibilidade",
    subtitulo: "Sistemas, integração e fluxo de informação",
    campos: ["sistemas_ferramentas", "integracao_sistemas", "tempo_planilhas"]
  },
  {
    numero: 4,
    titulo: "IA e Inovação",
    subtitulo: "Uso de tecnologia e inteligência artificial",
    campos: ["uso_ia_equipe"]
  },
  {
    numero: 5,
    titulo: "Metas e Cenário Ideal",
    subtitulo: "Expectativas e visão de futuro",
    campos: ["metas_semestre", "assistente_perfeito"]
  }
];
```

#### 4.2 Perguntas condicionais

Lógica para exibir/ocultar campos condicionais:

```typescript
// Pergunta 6.1 (integração) aparece se mencionar 2+ sistemas
const mostrarIntegracao = respostas.sistemas_ferramentas
  ?.split(/,|e|;/i)
  ?.filter(s => s.trim().length > 0)
  ?.length >= 2;

// Pergunta 6.2 (tempo em planilhas) aparece se mencionar planilha/Excel
const mostrarTempoPlanilhas = /planilha|excel|google sheets|sheets/i
  .test(respostas.sistemas_ferramentas || "");
```

---

### 5. API Routes

#### 5.1 Adaptar `POST /api/entrevistados`

Adicionar campo `tipo` no body:

```typescript
const schema = z.object({
  nome: z.string(),
  email: z.string().email().optional(),
  cargo: z.string(),
  area: z.string(),
  whatsapp: z.string(),
  sponsor_id: z.string(),
  tipo: z.enum(["gestor", "operador"]).default("gestor"), // NOVO
});
```

#### 5.2 Adaptar `PATCH /api/respostas`

Aceitar tipo de resposta dinamicamente:

```typescript
// Detectar tipo baseado no entrevistado existente
const entrevistado = await prisma.entrevistado.findUnique(...);

// Validar com schema apropriado
if (entrevistado.tipo === "gestor") {
  respostasGestorSchema.parse(body.respostas);
} else {
  respostasOperadorSchema.parse(body.respostas);
}
```

---

### 6. Páginas

#### 6.1 Página do formulário

Reutilizar rota existente: `/diagnostico/[uuid]`

Adaptar para detectar tipo de entrevistado e renderizar componente correto:

```typescript
// Em /diagnostico/[uuid]/page.tsx
const entrevistado = await prisma.entrevistado.findUnique({...});

if (entrevistado.tipo === "gestor") {
  return <DiagnosticoGestorForm entrevistado={entrevistado} />;
} else {
  return <DiagnosticoOperadorForm entrevistado={entrevistado} />;
}
```

#### 6.2 Página de criação de entrevistados (admin/PM)

Adicionar seleção de tipo no formulário de criação:

```typescript
<select name="tipo">
  <option value="gestor">Gestor/Líder</option>
  <option value="operador">Analista/Operador</option>
</select>
```

---

### 7. Fluxo de Dados

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  PM cria link   │────▶│  Entrevistado    │────▶│  Recebe email   │
│  (com tipo)     │     │  tipo="gestor"   │     │  ou WhatsApp    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                              │
                                                              ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Respostas      │◀────│  PATCH /api/     │◀────│  Preenche       │
│  salvas em JSON │     │  respostas       │     │  formulário     │
│  (por bloco)    │     │  (valida Zod)    │     │  (5 blocos)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Status:        │
│  concluido      │
└─────────────────┘
```

---

### 8. Checklist de Implementação

#### Backend
- [ ] Migration: adicionar `tipo` em `entrevistados`
- [ ] Atualizar Prisma schema
- [ ] Gerar Prisma Client (`npx prisma generate`)
- [ ] Tipos TypeScript: `TipoEntrevistado`, `RespostasGestor`
- [ ] Schema Zod: `respostasGestorSchema`
- [ ] Adaptar `POST /api/entrevistados` para aceitar `tipo`
- [ ] Adaptar `PATCH /api/respostas` para validar por tipo

#### Frontend
- [ ] Criar `DiagnosticoGestorForm.tsx` (5 blocos)
- [ ] Adaptar `/diagnostico/[uuid]/page.tsx` para escolher componente por tipo
- [ ] Adicionar seleção de tipo no formulário de criação de entrevistados
- [ ] Implementar lógica de perguntas condicionais (6.1, 6.2)
- [ ] Validação de 30 palavrias (gamificação) na pergunta 1

#### Admin
- [ ] Exibir tipo na listagem de entrevistados do sponsor
- [ ] Filtrar por tipo nas abas (Gestores | Operadores)

---

## Decisões de Design

1. **Campo `tipo` obrigatório**: A partir deste PR, todo entrevistado criado deve ter tipo explícito.

2. **Perguntas condicionais no frontend**: A lógica de exibir/ocultar 6.1 e 6.2 fica no React (não no banco), analisando o texto da resposta 6.

3. **Reutilização máxima**: Usar `FieldWithAudio` existente, mesmo design system `dl-*`, mesma estrutura de progresso por seção.

4. **API unificada**: Mesmo endpoint `/api/respostas` para ambos, detectando tipo no servidor para validação.

---

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `prisma/schema.prisma` | Adicionar `tipo` no model Entrevistado |
| `prisma/migrations/*` | Nova migration |
| `src/types/index.ts` | Novos tipos |
| `src/lib/validations.ts` | Novo schema Zod |
| `src/app/api/entrevistados/route.ts` | Aceitar campo `tipo` |
| `src/app/api/respostas/route.ts` | Validar por tipo |
| `src/app/diagnostico/[uuid]/page.tsx` | Escolher componente por tipo |
| `src/components/forms/DiagnosticoGestorForm.tsx` | NOVO |
| `src/components/admin/*` | Mostrar tipo, filtros |
