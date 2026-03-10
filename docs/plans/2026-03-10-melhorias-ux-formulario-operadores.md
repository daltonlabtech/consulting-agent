# Plano: Melhorias de UX no Formulário de Operadores

**Data:** 2026-03-10
**Arquivo:** `src/components/forms/DiagnosticoForm.tsx`

---

## Contexto

O formulário de operadores precisa das mesmas melhorias de UX implementadas no formulário de gestores para aumentar o engajamento de respondentes. As melhorias incluem: destaque para a opção de áudio na tela de boas-vindas, contexto personalizado por seção, uso do nome do respondente nas perguntas, e hints expandidos.

---

## Análise do Código Atual

O arquivo `DiagnosticoForm.tsx` possui:
- `primeiroNome` extraído de `entrevistadoNome.split(" ")[0]`
- Estrutura de 5 seções com perguntas variadas (texto, radio, select, checkbox)
- Tela de boas-vindas (`showWelcome`) e tela de conclusão (`isCompleted`)
- Campos de múltipla escolha na seção 4 (IA) que não existem no formulário de gestores
- Mínimo de 30 palavras por campo (vs 20 no formulário de gestores)

---

## Implementação

### 1. Card de Destaque para Áudio (Tela de Boas-vindas)

**Localização:** Após a descrição (linha 270) e antes das pills de info

**Componente a adicionar:**
```tsx
{/* Audio highlight card */}
<div
  className="dl-fade-up-4 dl-card p-5 border-l-4"
  style={{
    borderLeftColor: "hsl(var(--color-dl-primary))",
    background: "linear-gradient(90deg, hsl(var(--color-dl-primary) / 0.05), transparent)",
  }}
>
  <div className="flex items-start gap-3">
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: "hsl(var(--color-dl-primary) / 0.12)" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="hsl(var(--color-dl-primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    </div>
    <div className="space-y-1">
      <p
        className="font-semibold"
        style={{ color: "hsl(var(--color-dl-text))" }}
      >
        Prefira responder por áudio
      </p>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "hsl(var(--color-dl-muted))" }}
      >
        Falar é mais natural do que escrever. Suas respostas em áudio são transcritas
        automaticamente e ajudam nossos analistas a entender melhor o seu dia a dia.
        Não precisa ser perfeito — fale como se estivesse explicando para um colega.
      </p>
    </div>
  </div>
</div>
```

**Ajuste de animação:** Mudar `dl-fade-up-4` das pills para `dl-fade-up-5` e aplicar `dl-fade-up-4` no novo card. CTA vira `dl-fade-up-6`.

---

### 2. Headers de Seção com Contexto

**Localização:** No início de cada seção do formulário

**Implementação:** Adicionar abaixo do comentário de cada seção:

```tsx
{/* Section intro */}
<div
  className="py-4 text-base leading-relaxed"
  style={{ color: "hsl(var(--color-dl-muted))" }}
>
  {currentSection === 1 && (
    "{primeiroNome}, vamos começar entendendo como é o seu dia a dia. Queremos saber como funciona o trabalho na prática — desde quando você recebe uma demanda até entregar."
  )}
  {currentSection === 2 && (
    "Agora {primeiroNome}, queremos entender os desafios que você enfrenta. Não existe resposta certa ou errada — estamos buscando sua visão sincera sobre o que funciona bem e o que poderia melhorar."
  )}
  {currentSection === 3 && (
    "{primeiroNome}, as ferramentas que usamos dizem muito sobre como trabalhamos. Queremos entender quais sistemas você usa no dia a dia — o que funciona bem, o que dificulta, e onde pode haver oportunidades."
  )}
  {currentSection === 4 && (
    "Inteligência Artificial está transformando como as empresas trabalham. {primeiroNome}, queremos saber se você está usando (ou não) essas tecnologias no seu trabalho."
  )}
  {currentSection === 5 && (
    "Para finalizar, {primeiroNome}, queremos olhar para o futuro. Suas respostas aqui vão nos ajudar a entender o que seria um resultado excepcional na sua área."
  )}
</div>
```

---

### 3. Personalização das Perguntas com Nome

**Mapeamento de mudanças:**

| Seção | Campo | Label Atual | Novo Label |
|-------|-------|-------------|------------|
| 1 | p1_fluxo_principal | "Como funciona o fluxo principal do seu trabalho? Descreva desde o início até a entrega." | `{primeiroNome}, como funciona o fluxo principal do seu trabalho? Descreva desde o início até a entrega.` |
| 2 | p3_gargalos | "Onde estão os maiores gargalos ou atrasos no seu processo?" | `{primeiroNome}, onde estão os maiores gargalos ou atrasos no seu processo?` |
| 3 | p6_ferramentas | "Quais ferramentas/sistemas vocês usam no dia a dia?" | `{primeiroNome}, quais ferramentas/sistemas vocês usam no dia a dia?` |
| 5 | p10_metas | "Quais são as principais metas da sua área nos próximos 6-12 meses?" | `{primeiroNome}, quais são as principais metas da sua área nos próximos 6-12 meses?` |

**Nota:** A seção 4 (IA) tem radio button como primeira pergunta — sem personalização. Perguntas subsequentes de cada seção mantêm sem nome.

---

### 4. Expansão dos Hints

| Campo | Hint Atual | Novo Hint |
|-------|------------|-----------|
| p1_fluxo_principal | (sem hint) | `"Pense em um exemplo concreto: quando você recebe uma demanda, quais são os passos até entregar? Quem mais está envolvido?"` |
| p3_gargalos | (sem hint) | `"Pense em algo que acontece com frequência e que faz você perder tempo ou se frustrar."` |
| p6_ferramentas | (sem hint) | `"Mencione sistemas que você usa diariamente — planilhas, ERP, CRM, e-mail, WhatsApp, etc."` |
| p10_metas | (sem hint) | `"Pode ser algo que sua área precisa entregar, melhorar ou alcançar nos próximos meses."` |

---

## Checklist de Verificação

- [ ] Card de microfone aparece na welcome screen com destaque visual
- [ ] Animações `dl-fade-up-*` estão na ordem correta após inserção do card
- [ ] Cada seção mostra o intro text com nome correto e contexto adequado
- [ ] Perguntas 1, 3, 6, 10 mostram nome apenas na primeira pergunta de cada seção
- [ ] Hints expandidos nas perguntas 1, 3, 6, 10
- [ ] Campos de múltipla escolha (seção 4) não têm personalização com nome
- [ ] Layout responsivo mantido em telas menores
- [ ] Código segue padrões do design system `dl-*`

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/forms/DiagnosticoForm.tsx` | Adicionar card de microfone na welcome screen, adicionar section intros, personalizar perguntas com nome, expandir hints |
