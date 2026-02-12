# Phase 3 - Formulário de Diagnóstico 360

## Objetivo

Criar o formulário que cada entrevistado responde, com 5 seções de perguntas, lógica condicional, gravação de áudio com transcrição via Whisper, auto-save, e possibilidade de continuar depois. É a feature principal do produto.

## Contexto

- Cada entrevistado recebe um link único: `/diagnostico/[uuid]`
- O UUID identifica o entrevistado no banco
- Se o entrevistado já começou, o formulário carrega as respostas salvas e posiciona na seção correta
- Se já concluiu, mostra tela de "já respondido"

## Arquivos a Criar

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/diagnostico/[uuid]/page.tsx` | Server component - busca entrevistado por UUID e renderiza o form |
| `src/components/forms/DiagnosticoForm.tsx` | Client component principal - gerencia estado, navegação e submit |
| `src/components/forms/AudioRecorder.tsx` | Client component - gravação de áudio e envio pra transcrição |
| `src/components/forms/SectionProgress.tsx` | Componente visual de progresso (1/5, 2/5, etc.) |
| `src/app/api/respostas/route.ts` | API PATCH para salvar respostas |
| `src/app/api/transcribe/route.ts` | API POST para transcrição de áudio via Groq Whisper |
| `src/lib/whisper.ts` | Client do Groq para transcrição |

## Arquivos Compartilhados (já existem, não modificar)

| Arquivo | O que contém |
|---------|-------------|
| `src/lib/prisma.ts` | Instância singleton do Prisma Client |
| `src/lib/validations.ts` | Schema `respostasUpdateSchema` |
| `src/types/index.ts` | Interface `Respostas`, tipo `StatusEntrevistado` |

## Stack e Convenções

- Next.js App Router com TypeScript
- Tailwind CSS puro (sem component library)
- Prisma Client importado de `@/lib/prisma`
- Types importados de `@/types`
- Validações importadas de `@/lib/validations`
- API de transcrição usa Groq (compatível com SDK OpenAI, base URL: `https://api.groq.com/openai/v1`)
- Modelo de transcrição: `whisper-large-v3`
- A env var `OPENAI_API_KEY` contém a key do Groq

## Fluxo de Entrada

1. Entrevistado acessa `/diagnostico/[uuid]`
2. Server component busca entrevistado por UUID (include sponsor)
3. **UUID não encontrado** → renderizar página 404 amigável
4. **Status "concluido"** → renderizar tela de "Obrigado, você já respondeu"
5. **Status "nao_iniciado" ou "em_andamento"** → renderizar DiagnosticoForm com dados carregados

## Estrutura das 5 Seções

### Seção 1 — Processo Atual
| Campo | ID | Tipo | Obrigatório |
|-------|----|------|-------------|
| "Como funciona o fluxo principal do seu trabalho? Descreva desde o início até a entrega." | `p1_fluxo_principal` | textarea + audio | Sim |
| "Quem mais está envolvido nesse processo? (outras áreas, fornecedores, clientes)" | `p2_pessoas_envolvidas` | textarea + audio | Sim |

### Seção 2 — Dores e Gargalos
| Campo | ID | Tipo | Obrigatório |
|-------|----|------|-------------|
| "Onde estão os maiores gargalos ou atrasos no seu processo?" | `p3_gargalos` | textarea + audio | Sim |
| "Qual é o impacto desses gargalos? (tempo perdido, retrabalho, custo)" | `p4_impactos` | textarea + audio | Sim |
| "Tem alguma tarefa que vocês fazem de forma repetitiva e que poderia ser automatizada?" | `p5_tarefas_repetitivas` | textarea + audio | Sim |

### Seção 3 — Ferramentas (tem condicional)
| Campo | ID | Tipo | Obrigatório |
|-------|----|------|-------------|
| "Quais ferramentas/sistemas vocês usam no dia a dia?" | `p6_ferramentas` | textarea + audio | Sim |
| "Quanto tempo por semana vocês gastam nessas ferramentas fazendo tarefas manuais?" | `p7_tempo_ferramentas` | textarea + audio | Sim |
| **CONDICIONAL:** "Especificamente com planilhas, quanto tempo por semana?" | `p8a_tempo_planilhas` | select | Só se mencionou planilhas |
| **CONDICIONAL:** "Quais limitações do sistema atual mais incomodam?" | `p8b_limitacoes_sistema` | textarea + audio | Só se mencionou sistema/ERP |

**Regra condicional de planilhas:** Verificar se o texto de `p6_ferramentas` contém alguma das palavras: "planilha", "excel", "sheets", "google sheets" (case-insensitive). Se sim, mostrar campo `p8a_tempo_planilhas`.

**Opções do select `p8a_tempo_planilhas`:**
- Menos de 2h
- 2-5h
- 5-10h
- 10-20h
- Mais de 20h

**Regra condicional de sistema:** Verificar se o texto de `p6_ferramentas` contém alguma das palavras: "sistema", "erp", "sap", "totvs", "salesforce", "crm". Se sim, mostrar campo `p8b_limitacoes_sistema`.

### Seção 4 — Uso de IA (tem condicional)
| Campo | ID | Tipo | Obrigatório |
|-------|----|------|-------------|
| "A sua área já usa alguma ferramenta de IA?" | `p9_usa_ia` | radio (Sim/Não) | Sim |

**Se respondeu "Sim":**
| Campo | ID | Tipo | Obrigatório |
|-------|----|------|-------------|
| "Qual(is) ferramenta(s) de IA vocês usam?" | `p10a_ferramentas_ia` | multi-select | Sim |
| "Como vocês usam? Está funcionando bem?" | `p10b_como_usa` | textarea + audio | Sim |

**Opções do multi-select `p10a_ferramentas_ia`:**
- ChatGPT
- Copilot
- Gemini
- Claude
- Automações personalizadas
- Outro

**Se respondeu "Não":**
| Campo | ID | Tipo | Obrigatório |
|-------|----|------|-------------|
| "Por que ainda não?" | `p11_por_que_nao` | select | Sim |
| "Especifique:" | `p11_outro` | textarea | Só se selecionou "Outro" |

**Opções do select `p11_por_que_nao`:**
- Falta de tempo
- Falta de conhecimento
- Não se aplica
- Outro

### Seção 5 — Visão de Futuro
| Campo | ID | Tipo | Obrigatório |
|-------|----|------|-------------|
| "Quais são as principais metas da sua área nos próximos 6-12 meses?" | `p10_metas` | textarea + audio | Sim |
| "Se pudesse mudar uma coisa no seu processo com tecnologia, o que seria?" | `p11_cenario_ideal` | textarea + audio | Sim |

## Navegação entre Seções

- Progresso visual no topo (SectionProgress) mostrando "Seção X de 5"
- Botão **"Próxima Seção"** — salva respostas da seção atual e avança
  - Só habilitado quando todos os campos obrigatórios da seção estão preenchidos
- Botão **"Voltar"** — volta pra seção anterior (sem salvar, dados mantidos no state)
- Botão **"Continuar Depois"** — salva respostas atuais e mostra mensagem de que pode voltar pelo mesmo link
- Na seção 5, o botão é **"Concluir Diagnóstico"** em vez de "Próxima Seção"

## Auto-Save

### Quando salvar
- Ao clicar "Próxima Seção"
- Ao clicar "Continuar Depois"
- Ao clicar "Concluir Diagnóstico"

### API PATCH `/api/respostas`

**Input:**
```json
{
  "entrevistado_id": "uuid",
  "secao": 3,
  "respostas": { ...todasAsRespostasAteAgora }
}
```

**Comportamento:**
1. Validar com `respostasUpdateSchema`
2. Atualizar o registro do entrevistado:
   - `respostas` → objeto completo de respostas (merge com existente)
   - `secao_atual` → próxima seção (secao + 1, máximo 5)
   - `secoes_completadas` → adicionar seção ao array (sem duplicatas)
   - `status` → "em_andamento" (ou "concluido" se secao === 5)
   - `iniciado_em` → setar na primeira vez (se ainda null)
   - `concluido_em` → setar quando secao === 5

**Output - Sucesso (200):**
```json
{ "success": true }
```

**Output - Erro (400/500):**
```json
{ "success": false, "error": "mensagem" }
```

## Gravação e Transcrição de Áudio

### Componente AudioRecorder

- Botão de microfone posicionado dentro/ao lado de cada textarea
- Estados: idle → gravando → transcrevendo
- Ao parar gravação, envia áudio para `/api/transcribe`
- O texto transcrito é **concatenado** ao conteúdo existente do textarea (não substitui)
- Mostrar indicador visual durante gravação (botão vermelho pulsando)
- Mostrar "Transcrevendo..." durante processamento

### API POST `/api/transcribe`

**Input:** FormData com campo `audio` (Blob, tipo `audio/webm`)

**Comportamento:**
1. Extrair arquivo de áudio do FormData
2. Enviar para Groq API (compatível com OpenAI SDK)
   - Base URL: `https://api.groq.com/openai/v1`
   - Model: `whisper-large-v3`
   - Language: `pt`
   - A API key está em `process.env.OPENAI_API_KEY`
3. Retornar texto transcrito

**Output - Sucesso (200):**
```json
{ "transcript": "texto transcrito aqui" }
```

**Output - Erro (500):**
```json
{ "error": "Erro na transcrição" }
```

### `src/lib/whisper.ts`

Configurar o client OpenAI apontando para o Groq:
- `baseURL`: `https://api.groq.com/openai/v1`
- `apiKey`: `process.env.OPENAI_API_KEY`

## Tratamento de Estados

| Estado | O que mostrar |
|--------|--------------|
| Loading (buscando entrevistado) | Skeleton/spinner |
| UUID não encontrado | Página 404 amigável ("Link inválido ou expirado") |
| Já concluído | Tela de agradecimento ("Obrigado, suas respostas foram registradas!") |
| Salvando | Indicador sutil de "Salvando..." (não bloquear o form) |
| Erro ao salvar | Toast/banner com erro e opção de tentar novamente |
| Erro na transcrição | Mensagem inline no campo ("Erro ao transcrever, tente novamente") |

## UX e Acessibilidade

- Layout responsivo (mobile-first — entrevistados acessarão pelo celular via WhatsApp)
- Perguntas com texto grande e legível
- Textareas com altura suficiente pra respostas longas
- Transições suaves entre seções
- O nome do entrevistado e a empresa aparecem no topo como contexto
