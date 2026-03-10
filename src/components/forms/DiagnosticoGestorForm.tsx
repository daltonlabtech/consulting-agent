"use client";

import { useState, useEffect } from "react";
import { RespostasGestor } from "@/types";
import { AudioRecorder } from "./AudioRecorder";
import { SectionProgress } from "./SectionProgress";

interface DiagnosticoGestorFormProps {
  entrevistadoId: string;
  entrevistadoNome: string;
  empresaNome: string;
  initialSection: number;
  initialRespostas: RespostasGestor;
}

// Reusable textarea + audio field
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function FieldWithAudio({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  minWords = 20,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  minWords?: number;
}) {
  const wc = countWords(value);
  const pct = Math.min(100, (wc / minWords) * 100);
  const met = wc >= minWords;

  return (
    <div className="dl-card p-4 space-y-3">
      <label className="dl-label">{label}</label>
      {hint && <p className="text-sm" style={{ color: "hsl(var(--color-dl-muted))" }}>{hint}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="dl-input"
        placeholder="Escreva aqui ou use o microfone..."
      />
      <div className="space-y-1">
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "hsl(var(--color-dl-border))" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              backgroundColor: met
                ? "hsl(var(--color-dl-success))"
                : "hsl(var(--color-dl-accent))",
            }}
          />
        </div>
        <p
          className="text-xs text-right"
          style={{ color: met ? "hsl(var(--color-dl-success))" : "hsl(var(--color-dl-muted))" }}
        >
          {wc}/{minWords} palavras
        </p>
      </div>
      <div className="flex justify-end">
        <AudioRecorder
          onTranscript={(text) => onChange(value ? `${value}\n${text}` : text)}
        />
      </div>
    </div>
  );
}

// Section titles for managers form
const gestorSectionTitles: Record<number, string> = {
  1: "Visão da Área",
  2: "Desafios de Gestão",
  3: "Ferramentas",
  4: "IA e Inovação",
  5: "Metas e Cenário Ideal",
};

export function DiagnosticoGestorForm({
  entrevistadoId,
  entrevistadoNome,
  empresaNome,
  initialSection,
  initialRespostas,
}: DiagnosticoGestorFormProps) {
  const primeiroNome = entrevistadoNome.split(" ")[0];
  const isFirstAccess = initialSection === 1 && Object.keys(initialRespostas).length === 0;

  const [showWelcome, setShowWelcome] = useState(isFirstAccess);
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [respostas, setRespostas] = useState<RespostasGestor>(initialRespostas);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Section state helpers
  const updateResposta = (field: keyof RespostasGestor, value: string) => {
    setRespostas((prev) => ({ ...prev, [field]: value }));
  };

  // Conditional logic for section 3 (tools)
  const sistemasText = respostas.sistemas_ferramentas ?? "";
  // Show integracao if 2+ systems mentioned (split by comma, "e", or semicolon)
  const sistemasCount = sistemasText
    .split(/,|e|;/i)
    .filter((s) => s.trim().length > 0).length;
  const mostrarIntegracao = sistemasCount >= 2;
  // Show tempo_planilhas if mentions spreadsheet/Excel
  const mostrarTempoPlanilhas = /planilha|excel|google sheets|sheets/i.test(sistemasText);

  // Section validation
  const isSectionValid = (): boolean => {
    switch (currentSection) {
      case 1:
        return (
          countWords(respostas.visao_geral ?? "") >= 20 &&
          countWords(respostas.interdependencias ?? "") >= 20
        );
      case 2:
        return (
          countWords(respostas.principal_problema ?? "") >= 20 &&
          countWords(respostas.impacto_pratico ?? "") >= 20 &&
          countWords(respostas.atividade_repetitiva ?? "") >= 20
        );
      case 3: {
        if (countWords(respostas.sistemas_ferramentas ?? "") < 20) return false;
        if (mostrarIntegracao && countWords(respostas.integracao_sistemas ?? "") < 20) return false;
        if (mostrarTempoPlanilhas && countWords(respostas.tempo_planilhas ?? "") < 20) return false;
        return true;
      }
      case 4:
        return countWords(respostas.uso_ia_equipe ?? "") >= 20;
      case 5:
        return (
          countWords(respostas.metas_semestre ?? "") >= 20 &&
          countWords(respostas.assistente_perfeito ?? "") >= 20
        );
      default:
        return false;
    }
  };

  const save = async (options: { advance?: boolean; finish?: boolean; continuar?: boolean }) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/respostas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entrevistado_id: entrevistadoId,
          secao: currentSection,
          respostas,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Erro ao salvar");

      if (options.finish) {
        setIsCompleted(true);
      } else if (options.advance) {
        setCurrentSection((s) => s + 1);
      } else if (options.continuar) {
        showToast("Suas respostas foram salvas. Você pode voltar pelo mesmo link.");
      }
    } catch {
      setSaveError("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Scroll to top on section change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSection]);

  /* ── Welcome screen ────────────────────────────────────────────── */
  if (showWelcome) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}
      >
        <div className="w-full max-w-lg dl-card overflow-hidden">
          {/* Gradient top bar */}
          <div
            style={{
              height: 4,
              background: "linear-gradient(90deg, hsl(var(--color-dl-primary)), hsl(var(--color-dl-accent)))",
            }}
          />

          <div className="px-8 py-10 space-y-8">
            {/* Branding */}
            <div className="dl-fade-up-1 flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--color-dl-primary)), hsl(var(--color-dl-accent)))",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="dl-eyebrow" style={{ color: "hsl(var(--color-dl-muted))" }}>
                Dalton Lab
              </span>
            </div>

            {/* Greeting */}
            <div className="dl-fade-up-2 space-y-1">
              <h1
                className="text-3xl font-bold tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)", color: "hsl(var(--color-dl-text))" }}
              >
                Olá, {primeiroNome}!
              </h1>
              <p
                className="text-base font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "hsl(var(--color-dl-primary))" }}
              >
                Diagnóstico de Gestão e Liderança
              </p>
            </div>

            {/* Description */}
            <p
              className="dl-fade-up-3 text-base leading-relaxed"
              style={{ color: "hsl(var(--color-dl-muted))" }}
            >
              Como líder da área, você tem uma visão estratégica fundamental sobre como o time funciona.
              Queremos entender sua perspectiva sobre desafios, ferramentas e oportunidades de melhoria
              — para identificar onde a IA pode fazer a diferença na gestão da {empresaNome}.
            </p>

            {/* Info pills */}
            <div className="dl-fade-up-4 flex flex-wrap gap-2">
              {["5 seções", "~10 perguntas", "Texto ou áudio"].map((label) => (
                <span key={label} className="dl-pill">
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: "hsl(var(--color-dl-primary))" }}
                  />
                  {label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              className="dl-fade-up-5 dl-btn-primary w-full"
            >
              Iniciar Diagnóstico
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Completion screen ─────────────────────────────────────────── */
  if (isCompleted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}
      >
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "hsl(var(--color-dl-success) / 0.12)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "hsl(var(--color-dl-text))" }}
          >
            Obrigado, {entrevistadoNome}!
          </h1>
          <p style={{ color: "hsl(var(--color-dl-muted))", fontSize: "1rem" }}>
            Suas respostas foram registradas com sucesso. Sua visão como líder é essencial para
            construirmos um plano de transformação alinhado com as necessidades reais da área.
          </p>
        </div>
      </div>
    );
  }

  /* ── Main form ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}>
      {/* Sticky header */}
      <div className="dl-bar border-b px-4 py-4 sticky top-0 z-10" style={{ borderColor: "hsl(var(--color-dl-border))" }}>
        <div className="max-w-lg mx-auto space-y-3">
          <div>
            <p className="dl-eyebrow">{empresaNome}</p>
            <p
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "hsl(var(--color-dl-text))" }}
            >
              {entrevistadoNome}
            </p>
          </div>
          <SectionProgress current={currentSection} titles={gestorSectionTitles} />
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1 — Visão da Área
        ═══════════════════════════════════════════════════════════════ */}
        {currentSection === 1 && (
          <>
            <FieldWithAudio
              label="1. Como você descreveria a função principal do seu time?"
              hint="Qual é o papel da sua área dentro da empresa?"
              value={respostas.visao_geral ?? ""}
              onChange={(v) => updateResposta("visao_geral", v)}
            />
            <FieldWithAudio
              label="2. Com quais outras áreas o seu time trabalha de forma mais próxima?"
              hint="Pense nas interdependências e colaborações mais frequentes."
              value={respostas.interdependencias ?? ""}
              onChange={(v) => updateResposta("interdependencias", v)}
            />
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — Desafios de Gestão
        ═══════════════════════════════════════════════════════════════ */}
        {currentSection === 2 && (
          <>
            <FieldWithAudio
              label="3. Qual é o principal desafio ou problema que você enfrenta na gestão do time hoje?"
              hint="Pense em algo que consome seu tempo ou gera frustração recorrente."
              value={respostas.principal_problema ?? ""}
              onChange={(v) => updateResposta("principal_problema", v)}
            />
            <FieldWithAudio
              label="4. Como esse problema se manifesta no dia a dia?"
              hint="Dê exemplos concretos de como isso afeta a operação ou resultados."
              value={respostas.impacto_pratico ?? ""}
              onChange={(v) => updateResposta("impacto_pratico", v)}
            />
            <FieldWithAudio
              label="5. Existe alguma atividade que o time faz de forma repetitiva que poderia ser automatizada?"
              hint="Tarefas manuais, cópia de dados, geração de relatórios..."
              value={respostas.atividade_repetitiva ?? ""}
              onChange={(v) => updateResposta("atividade_repetitiva", v)}
            />
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — Ferramentas
        ═══════════════════════════════════════════════════════════════ */}
        {currentSection === 3 && (
          <>
            <FieldWithAudio
              label="6. Quais sistemas e ferramentas o time usa no dia a dia?"
              hint="Mencione ERP, CRM, planilhas, sistemas internos, etc."
              value={respostas.sistemas_ferramentas ?? ""}
              onChange={(v) => updateResposta("sistemas_ferramentas", v)}
            />
            {mostrarIntegracao && (
              <FieldWithAudio
                label="6.1. Como esses sistemas se conversam hoje? Existe integração entre eles?"
                hint="Dados fluem automaticamente ou há trabalho manual de cópia entre sistemas?"
                value={respostas.integracao_sistemas ?? ""}
                onChange={(v) => updateResposta("integracao_sistemas", v)}
              />
            )}
            {mostrarTempoPlanilhas && (
              <FieldWithAudio
                label="6.2. Quanto tempo o time gera em média trabalhando com planilhas por semana?"
                hint="Estimativa em horas — considere criação, atualização, consolidação de dados."
                value={respostas.tempo_planilhas ?? ""}
                onChange={(v) => updateResposta("tempo_planilhas", v)}
              />
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4 — IA e Inovação
        ═══════════════════════════════════════════════════════════════ */}
        {currentSection === 4 && (
          <>
            <FieldWithAudio
              label="7. Como você está usando IA na sua área hoje?"
              hint="Ferramentas como ChatGPT, Copilot, automações... ou ainda não usa? Como vê o potencial?"
              value={respostas.uso_ia_equipe ?? ""}
              onChange={(v) => updateResposta("uso_ia_equipe", v)}
            />
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5 — Metas e Cenário Ideal
        ═══════════════════════════════════════════════════════════════ */}
        {currentSection === 5 && (
          <>
            <FieldWithAudio
              label="8. Quais são as principais metas do seu time para este semestre?"
              hint="O que precisa ser entregue ou melhorado nos próximos 6 meses?"
              value={respostas.metas_semestre ?? ""}
              onChange={(v) => updateResposta("metas_semestre", v)}
            />
            <FieldWithAudio
              label="9. Se você pudesse ter um assistente perfeito para sua área, o que ele faria?"
              hint="Imagine não ter limitações de tecnologia — quais tarefas esse assistente assumiria?"
              value={respostas.assistente_perfeito ?? ""}
              onChange={(v) => updateResposta("assistente_perfeito", v)}
            />
          </>
        )}
      </div>

      {/* Sticky footer navigation */}
      <div
        className="dl-bar border-t px-4 py-4 sticky bottom-0 z-10"
        style={{ borderColor: "hsl(var(--color-dl-border))" }}
      >
        <div className="max-w-lg mx-auto space-y-3">
          {saveError && (
            <p className="dl-error text-center">{saveError}</p>
          )}
          <div className="flex gap-3">
            {currentSection > 1 && (
              <button
                type="button"
                onClick={() => setCurrentSection((s) => s - 1)}
                disabled={isSaving}
                className="dl-btn-ghost flex-1"
              >
                Voltar
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                currentSection === 5
                  ? save({ finish: true })
                  : save({ advance: true })
              }
              disabled={!isSectionValid() || isSaving}
              className="dl-btn-primary flex-1"
            >
              {isSaving
                ? "Salvando..."
                : currentSection === 5
                ? "Concluir Diagnóstico"
                : "Próxima Seção"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => save({ continuar: true })}
            disabled={isSaving}
            className="dl-link-muted"
          >
            Continuar depois
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="dl-toast">
          {toast}
        </div>
      )}
    </div>
  );
}
