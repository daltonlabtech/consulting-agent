# Design: Melhorias de UX no Formulário de Gestores

**Data:** 2026-03-10
**Escopo:** Formulário de Gestores (DiagnosticoGestorForm)
**Status:** Pronto para implementação

## Contexto

O formulário de gestores é preenchido por pessoas que não contrataram o serviço — elas recebem o link do CEO ou de nós. Portanto, chegam sem contexto sobre o projeto e precisam de mais explicações para se sentirem confortáveis respondendo.

## Objetivos

1. Aumentar o engajamento destacando a opção de áudio
2. Criar contexto antes de cada bloco de perguntas
3. Personalizar a experiência usando o nome do respondente

## Implementação

### 1. Tela de Boas-vindas — Destaque para Microfone

**Localização:** Após o texto de introdução, antes do botão "Iniciar"

**Componente:** Card visualmente destacado com:
- Border ou gradiente primário (`--color-dl-primary`)
- Ícone de microfone (`mic` ou similar do Lucide)
- Título: "Prefira responder por áudio"
- Texto explicativo: "Falar é mais natural do que escrever. Suas respostas em áudio são transcritas automaticamente e ajudam nossos analistas a capturar nuances do seu dia a dia que o texto às vezes não consegue expressar. Não precisa ser perfeito — fale como se estivesse conversando com um colega."

**Estilo:** Usar `dl-card` com variação de destaque visual.

### 2. Headers de Seção — Contexto por Bloco

**Localização:** Dentro do formulário, acima das perguntas de cada seção (1-5)

**Estrutura:**
```tsx
<div className="py-4 text-base leading-relaxed" style={{ color: "hsl(var(--color-dl-muted))" }}>
  {sectionIntro[section](primeiroNome, empresaNome)}
</div>
```

**Conteúdo dos intros:**

| Seção | Texto |
|-------|-------|
| 1 - Visão da Área | "Diego, vamos começar entendendo um pouco sobre a sua área. Queremos saber como o seu time se encaixa na empresa e com quem vocês mais interagem no dia a dia." |
| 2 - Desafios | "Agora Diego, queremos entender os desafios que você enfrenta na gestão. Não existe resposta certa ou errada — estamos buscando sua visão sincera sobre o que funciona bem e o que poderia melhorar." |
| 3 - Ferramentas | "Diego, as ferramentas que usamos dizem muito sobre como trabalhamos. Queremos entender o ecossistema de sistemas do seu time — o que funciona bem, o que dificulta, e onde pode haver oportunidades." |
| 4 - IA | "Inteligência Artificial está transformando como as empresas trabalham. Diego, queremos saber como você e seu time estão usando (ou não) essas tecnologias, e como enxergam o potencial delas." |
| 5 - Metas | "Para finalizar, Diego, queremos olhar para o futuro. Suas respostas aqui vão nos ajudar a entender o que seria um resultado excepcional para a {empresa} — e como a IA pode fazer parte disso." |

**Regras:**
- Usar `primeiroNome` extraído de `entrevistadoNome.split(" ")[0]`
- Texto em cor muted (`--color-dl-muted`)
- Sem card/container adicional — texto solto para não competir com as perguntas

### 3. Perguntas Personalizadas — Uso do Nome

**Regra geral:**
- Usar o nome na **primeira pergunta** de cada seção
- **Não usar** nas perguntas seguintes da mesma seção
- Posicionar no início ou final da frase (nunca no meio)

**Mapeamento:**

| Seção | Pergunta | Uso do Nome |
|-------|----------|-------------|
| 1 | Pergunta 1 (visão geral) | "Diego, como você descreveria..." |
| 1 | Pergunta 2 (interdependências) | Sem nome |
| 2 | Pergunta 3 (problema) | "Diego, qual é o principal desafio..." |
| 2 | Pergunta 4 (impacto) | Sem nome |
| 2 | Pergunta 5 (atividade repetitiva) | Sem nome |
| 3 | Pergunta 6 (sistemas) | "Diego, quais sistemas..." |
| 3 | Pergunta 6.1 (condicional) | Sem nome |
| 3 | Pergunta 6.2 (condicional) | Sem nome |
| 4 | Pergunta 7 (IA) | "Diego, como você está usando IA..." |
| 5 | Pergunta 8 (metas) | "Diego, quais são as principais metas..." |
| 5 | Pergunta 9 (assistente) | Sem nome |

### 4. Ajustes nos Hints

Alguns hints podem ser expandidos para dar mais contexto:

- Pergunta 1: hint atual + "Pense no que seu time entrega para outras áreas."
- Pergunta 3: hint atual + "Pode ser algo que você já tentou resolver ou que parece difícil de resolver."
- Pergunta 7: hint atual + "Não se preocupe se ainda não usa — queremos saber sua visão sobre o tema."

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/components/forms/DiagnosticoGestorForm.tsx` | Adicionar card de microfone na welcome screen, adicionar section intros, personalizar perguntas com nome |

## Notas de Implementação

1. Manter consistência visual com o design system `dl-*` existente
2. Testar responsividade dos textos mais longos em mobile
3. Garantir que o nome é sempre o primeiro nome (split no espaço)
4. Validar que textos em áudio também são aceitos (os hints explicam, mas a funcionalidade já existe)

## Checklist de Teste

- [ ] Card de microfone aparece na welcome screen
- [ ] Card tem destaque visual adequado (não polui, mas chama atenção)
- [ ] Cada seção mostra o intro text com nome correto
- [ ] Perguntas personalizadas mostram nome apenas na primeira de cada seção
- [ ] Layout responsivo em telas menores
- [ ] Nenhuma quebra de layout com textos longos

---

**Próximo passo:** Implementar mudanças no DiagnosticoGestorForm.tsx
