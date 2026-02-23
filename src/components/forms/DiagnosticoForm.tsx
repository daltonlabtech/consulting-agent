"use client";

import { useState, useEffect } from "react";
import { Respostas } from "@/types";
import { AudioRecorder } from "./AudioRecorder";
import { SectionProgress } from "./SectionProgress";

interface DiagnosticoFormProps {
  entrevistadoId: string;
  entrevistadoNome: string;
  empresaNome: string;
  initialSection: number;
  initialRespostas: Respostas;
}

// Reusable textarea + audio field
function FieldWithAudio({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-base font-medium text-gray-800 leading-snug">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="flex justify-end">
        <AudioRecorder
          onTranscript={(text) =>
            onChange(value ? `${value}\n${text}` : text)
          }
        />
      </div>
    </div>
  );
}

const TOOLS_IA = ["ChatGPT", "Copilot", "Gemini", "Claude", "Automações personalizadas", "Outro"];
const OPTIONS_POR_QUE_NAO = ["Falta de tempo", "Falta de conhecimento", "Não se aplica", "Outro"];
const OPTIONS_TEMPO_PLANILHAS = ["Menos de 2h", "2-5h", "5-10h", "10-20h", "Mais de 20h"];

export function DiagnosticoForm({
  entrevistadoId,
  entrevistadoNome,
  empresaNome,
  initialSection,
  initialRespostas,
}: DiagnosticoFormProps) {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [respostas, setRespostas] = useState<Respostas>(initialRespostas);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Section state helpers
  const s1 = respostas.secao_1 ?? { p1_fluxo_principal: "", p2_pessoas_envolvidas: "" };
  const s2 = respostas.secao_2 ?? { p3_gargalos: "", p4_impactos: "", p5_tarefas_repetitivas: "" };
  const s3 = respostas.secao_3 ?? { p6_ferramentas: "", p7_tempo_ferramentas: "" };
  const s4 = respostas.secao_4 ?? { p9_usa_ia: undefined as unknown as "Sim" | "Não" };
  const s5 = respostas.secao_5 ?? { p10_metas: "", p11_cenario_ideal: "" };

  const updateS1 = (field: keyof typeof s1, value: string) =>
    setRespostas((prev) => ({ ...prev, secao_1: { ...s1, [field]: value } }));

  const updateS2 = (field: keyof typeof s2, value: string) =>
    setRespostas((prev) => ({ ...prev, secao_2: { ...s2, [field]: value } }));

  const updateS3 = (field: keyof typeof s3, value: string) =>
    setRespostas((prev) => ({ ...prev, secao_3: { ...s3, [field]: value } }));

  const updateS4 = <K extends keyof NonNullable<Respostas["secao_4"]>>(
    field: K,
    value: NonNullable<Respostas["secao_4"]>[K]
  ) => setRespostas((prev) => ({ ...prev, secao_4: { ...s4, [field]: value } }));

  const updateS5 = (field: keyof typeof s5, value: string) =>
    setRespostas((prev) => ({ ...prev, secao_5: { ...s5, [field]: value } }));

  // Conditional logic for section 3
  const ferramentasText = (s3.p6_ferramentas ?? "").toLowerCase();
  const showPlanilhas = /planilha|excel|sheets|google sheets/.test(ferramentasText);
  const showSistema = /sistema|erp|sap|totvs|salesforce|crm/.test(ferramentasText);

  // Section validation
  const isSectionValid = (): boolean => {
    switch (currentSection) {
      case 1:
        return !!s1.p1_fluxo_principal?.trim() && !!s1.p2_pessoas_envolvidas?.trim();
      case 2:
        return (
          !!s2.p3_gargalos?.trim() &&
          !!s2.p4_impactos?.trim() &&
          !!s2.p5_tarefas_repetitivas?.trim()
        );
      case 3: {
        if (!s3.p6_ferramentas?.trim() || !s3.p7_tempo_ferramentas?.trim()) return false;
        if (showPlanilhas && !s3.p8a_tempo_planilhas) return false;
        if (showSistema && !s3.p8b_limitacoes_sistema?.trim()) return false;
        return true;
      }
      case 4: {
        if (!s4.p9_usa_ia) return false;
        if (s4.p9_usa_ia === "Sim") {
          return !!(s4.p10a_ferramentas_ia?.length && s4.p10b_como_usa?.trim());
        } else {
          if (!s4.p11_por_que_nao) return false;
          if (s4.p11_por_que_nao === "Outro" && !s4.p11_outro?.trim()) return false;
          return true;
        }
      }
      case 5:
        return !!s5.p10_metas?.trim() && !!s5.p11_cenario_ideal?.trim();
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

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Obrigado, {entrevistadoNome}!
          </h1>
          <p className="text-gray-600 text-base">
            Suas respostas foram registradas com sucesso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto space-y-3">
          <div>
            <p className="text-sm text-gray-500">{empresaNome}</p>
            <p className="text-base font-semibold text-gray-800">{entrevistadoNome}</p>
          </div>
          <SectionProgress current={currentSection} />
        </div>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {currentSection === 1 && (
          <>
            <FieldWithAudio
              label="Como funciona o fluxo principal do seu trabalho? Descreva desde o início até a entrega."
              value={s1.p1_fluxo_principal ?? ""}
              onChange={(v) => updateS1("p1_fluxo_principal", v)}
            />
            <FieldWithAudio
              label="Quem mais está envolvido nesse processo? (outras áreas, fornecedores, clientes)"
              value={s1.p2_pessoas_envolvidas ?? ""}
              onChange={(v) => updateS1("p2_pessoas_envolvidas", v)}
            />
          </>
        )}

        {currentSection === 2 && (
          <>
            <FieldWithAudio
              label="Onde estão os maiores gargalos ou atrasos no seu processo?"
              value={s2.p3_gargalos ?? ""}
              onChange={(v) => updateS2("p3_gargalos", v)}
            />
            <FieldWithAudio
              label="Qual é o impacto desses gargalos? (tempo perdido, retrabalho, custo)"
              value={s2.p4_impactos ?? ""}
              onChange={(v) => updateS2("p4_impactos", v)}
            />
            <FieldWithAudio
              label="Tem alguma tarefa que vocês fazem de forma repetitiva e que poderia ser automatizada?"
              value={s2.p5_tarefas_repetitivas ?? ""}
              onChange={(v) => updateS2("p5_tarefas_repetitivas", v)}
            />
          </>
        )}

        {currentSection === 3 && (
          <>
            <FieldWithAudio
              label="Quais ferramentas/sistemas vocês usam no dia a dia?"
              value={s3.p6_ferramentas ?? ""}
              onChange={(v) => updateS3("p6_ferramentas", v)}
            />
            <FieldWithAudio
              label="Quanto tempo por semana vocês gastam nessas ferramentas fazendo tarefas manuais?"
              value={s3.p7_tempo_ferramentas ?? ""}
              onChange={(v) => updateS3("p7_tempo_ferramentas", v)}
            />
            {showPlanilhas && (
              <div className="space-y-2">
                <label className="block text-base font-medium text-gray-800 leading-snug">
                  Especificamente com planilhas, quanto tempo por semana?
                </label>
                <select
                  value={s3.p8a_tempo_planilhas ?? ""}
                  onChange={(e) => updateS3("p8a_tempo_planilhas", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Selecione...</option>
                  {OPTIONS_TEMPO_PLANILHAS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            )}
            {showSistema && (
              <FieldWithAudio
                label="Quais limitações do sistema atual mais incomodam?"
                value={s3.p8b_limitacoes_sistema ?? ""}
                onChange={(v) => updateS3("p8b_limitacoes_sistema", v)}
              />
            )}
          </>
        )}

        {currentSection === 4 && (
          <>
            {/* p9_usa_ia - radio */}
            <div className="space-y-3">
              <label className="block text-base font-medium text-gray-800">
                A sua área já usa alguma ferramenta de IA?
              </label>
              <div className="flex gap-4">
                {(["Sim", "Não"] as const).map((opt) => (
                  <label
                    key={opt}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      s4.p9_usa_ia === opt
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="p9_usa_ia"
                      value={opt}
                      checked={s4.p9_usa_ia === opt}
                      onChange={() => updateS4("p9_usa_ia", opt)}
                      className="sr-only"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {s4.p9_usa_ia === "Sim" && (
              <>
                {/* p10a - multi-select checkboxes */}
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-800">
                    Qual(is) ferramenta(s) de IA vocês usam?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TOOLS_IA.map((tool) => {
                      const selected = s4.p10a_ferramentas_ia?.includes(tool) ?? false;
                      return (
                        <label
                          key={tool}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            selected
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              const current = s4.p10a_ferramentas_ia ?? [];
                              const updated = selected
                                ? current.filter((f) => f !== tool)
                                : [...current, tool];
                              updateS4("p10a_ferramentas_ia", updated);
                            }}
                            className="sr-only"
                          />
                          <span
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                              selected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                            }`}
                          >
                            {selected && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>
                          <span className="text-sm font-medium">{tool}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <FieldWithAudio
                  label="Como vocês usam? Está funcionando bem?"
                  value={s4.p10b_como_usa ?? ""}
                  onChange={(v) => updateS4("p10b_como_usa", v)}
                />
              </>
            )}

            {s4.p9_usa_ia === "Não" && (
              <>
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-800">
                    Por que ainda não?
                  </label>
                  <select
                    value={s4.p11_por_que_nao ?? ""}
                    onChange={(e) =>
                      updateS4("p11_por_que_nao", e.target.value as NonNullable<Respostas["secao_4"]>["p11_por_que_nao"])
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Selecione...</option>
                    {OPTIONS_POR_QUE_NAO.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {s4.p11_por_que_nao === "Outro" && (
                  <div className="space-y-2">
                    <label className="block text-base font-medium text-gray-800">
                      Especifique:
                    </label>
                    <textarea
                      value={s4.p11_outro ?? ""}
                      onChange={(e) => updateS4("p11_outro", e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {currentSection === 5 && (
          <>
            <FieldWithAudio
              label="Quais são as principais metas da sua área nos próximos 6-12 meses?"
              value={s5.p10_metas ?? ""}
              onChange={(v) => updateS5("p10_metas", v)}
            />
            <FieldWithAudio
              label="Se pudesse mudar uma coisa no seu processo com tecnologia, o que seria?"
              value={s5.p11_cenario_ideal ?? ""}
              onChange={(v) => updateS5("p11_cenario_ideal", v)}
            />
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3">
          {saveError && (
            <p className="text-sm text-red-600 text-center">{saveError}</p>
          )}
          <div className="flex gap-3">
            {currentSection > 1 && (
              <button
                type="button"
                onClick={() => setCurrentSection((s) => s - 1)}
                disabled={isSaving}
                className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium text-base hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
              className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-medium text-base hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
          >
            Continuar depois
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto bg-gray-800 text-white text-sm px-4 py-3 rounded-lg shadow-lg z-50 text-center">
          {toast}
        </div>
      )}
    </div>
  );
}
