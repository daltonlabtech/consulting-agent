"use client";

import { useState } from "react";
import { SponsorFormResponses, SponsorKeyPerson } from "@/types";
import { AudioRecorder } from "./AudioRecorder";

// ─── Section titles ────────────────────────────────────────────────────────────

const SECTION_TITLES: Record<number, string> = {
  1: "Validação Rápida",
  2: "O que Funciona Bem",
  3: "Profundidade Operacional",
  4: "O Time e a Cultura",
  5: "Expectativas",
  6: "Pessoas-chave",
};

// ─── People challenges options (Section 4.3) ─────────────────────────────────

const PEOPLE_CHALLENGES = [
  "Dificuldade de contratar profissionais qualificados",
  "Turnover alto em áreas-chave",
  "Sobrecarga de trabalho em poucas pessoas",
  "Falta de clareza em papéis e responsabilidades",
  "Comunicação entre áreas precisa melhorar",
  "Nenhum desafio relevante no momento",
];

const CHANGE_OPENNESS_OPTIONS = [
  { value: "very_open", label: "Muito aberto — o time abraça mudanças rápido" },
  { value: "open_guided", label: "Aberto, mas precisa de direcionamento e treinamento" },
  { value: "resistant_adapts", label: "Resistente no início, mas se adapta depois de ver resultado" },
  { value: "resistant", label: "Bastante resistente — mudanças são um desafio constante" },
];

const CONTACT_PREFERENCE_OPTIONS = [
  { value: "direct_notified", label: "Podem entrar em contato direto — eu aviso o time por conta" },
  { value: "direct_no_notice", label: "Podem entrar em contato direto — não precisa avisar" },
  { value: "wait_for_me", label: "Prefiro avisar o time primeiro e depois libero o contato de vocês" },
];

const INTEGRATION_SCORE_LABELS: Record<number, string> = {
  1: "Cada sistema é uma ilha, nada conversa",
  2: "Pouca integração, muito trabalho manual",
  3: "Algumas coisas conversam, outras não",
  4: "Boa integração, poucos gaps",
  5: "Tudo conversa entre si, fluxo contínuo",
};

// ─── Reusable components ──────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function FieldWithAudio({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  minWords = 30,
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

function ValidationField({
  label,
  prefilled,
  confirmed,
  correction,
  onConfirm,
  onCorrectionChange,
}: {
  label: string;
  prefilled: string | null;
  confirmed: boolean | undefined;
  correction: string | undefined;
  onConfirm: (v: boolean) => void;
  onCorrectionChange: (v: string) => void;
}) {
  return (
    <div className="dl-card p-4 space-y-3">
      <p className="dl-label">{label}</p>

      {/* Pre-filled content */}
      <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: "hsl(var(--color-dl-primary) / 0.06)", border: "1px solid hsl(var(--color-dl-primary) / 0.2)", color: "hsl(var(--color-dl-text))" }}>
        {prefilled || <span style={{ color: "hsl(var(--color-dl-muted))" }}><em>Não informado — adicione abaixo se necessário.</em></span>}
      </div>

      {/* Confirm / Correct radio */}
      <div className="flex flex-col gap-2">
        <label
          className={`dl-option-card${confirmed === true ? " selected" : ""}`}
          onClick={() => onConfirm(true)}
        >
          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
            style={{ borderColor: confirmed === true ? "hsl(var(--color-dl-primary))" : "hsl(var(--color-dl-border))" }}>
            {confirmed === true && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--color-dl-primary))" }} />}
          </div>
          <span className="text-sm">Correto</span>
        </label>

        <label
          className={`dl-option-card${confirmed === false ? " selected" : ""}`}
          onClick={() => onConfirm(false)}
        >
          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
            style={{ borderColor: confirmed === false ? "hsl(var(--color-dl-primary))" : "hsl(var(--color-dl-border))" }}>
            {confirmed === false && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--color-dl-primary))" }} />}
          </div>
          <span className="text-sm">Precisa de ajuste</span>
        </label>
      </div>

      {/* Correction field */}
      {confirmed === false && (
        <div className="space-y-2">
          <textarea
            value={correction ?? ""}
            onChange={(e) => onCorrectionChange(e.target.value)}
            rows={3}
            className="dl-input"
            placeholder="O que está diferente?"
          />
          <div className="flex justify-end">
            <AudioRecorder
              onTranscript={(text) =>
                onCorrectionChange(correction ? `${correction}\n${text}` : text)
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function SponsorProgress({ current }: { current: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="dl-eyebrow" style={{ color: "hsl(var(--color-dl-text))" }}>
          {SECTION_TITLES[current]}
        </span>
        <span className="dl-eyebrow">{current}/6</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`dl-progress-segment${i + 1 <= current ? " active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Empty person factory ─────────────────────────────────────────────────────

const emptyPerson = (): SponsorKeyPerson => ({ nome: "", cargo: "", area: "", whatsapp: "" });

function normalizeWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (!digits.startsWith("55") && digits.length >= 10) return `+55${digits}`;
  return value;
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  sponsorId: string;
  sponsorNome: string;
  empresaNome: string;
  briefingAreas: string | null;
  briefingSystems: string | null;
  briefingAiUsage: string | null;
  initialResponses: SponsorFormResponses;
  formStatus: string;
}

export function DiagnosticoSponsorForm({
  sponsorId,
  sponsorNome,
  empresaNome,
  briefingAreas,
  briefingSystems,
  briefingAiUsage,
  initialResponses,
}: Props) {
  const primeiroNome = sponsorNome.split(" ")[0];
  const isFirstAccess = Object.keys(initialResponses).length === 0;

  const [showWelcome, setShowWelcome] = useState(isFirstAccess);
  const [currentSection, setCurrentSection] = useState(1);
  const [responses, setResponses] = useState<SponsorFormResponses>(initialResponses);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Section 6 people list
  const [people, setPeople] = useState<SponsorKeyPerson[]>(
    initialResponses.s6_key_people?.length
      ? initialResponses.s6_key_people
      : [emptyPerson(), emptyPerson(), emptyPerson()]
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // ── Update helpers ────────────────────────────────────────────────────────

  const update = <K extends keyof SponsorFormResponses>(key: K, value: SponsorFormResponses[K]) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const toggleChallenge = (challenge: string) => {
    const current = responses.s4_people_challenges ?? [];
    if (current.includes(challenge)) {
      update("s4_people_challenges", current.filter((c) => c !== challenge));
    } else if (current.length < 2) {
      update("s4_people_challenges", [...current, challenge]);
    }
  };

  const updatePerson = (index: number, field: keyof SponsorKeyPerson, value: string) => {
    setPeople((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  // ── Save section ─────────────────────────────────────────────────────────

  const saveSection = async (sectionNumber: number, extraResponses?: Partial<SponsorFormResponses>) => {
    setIsSaving(true);
    setSaveError(null);

    const sectionResponses = { ...responses, ...extraResponses };

    try {
      const res = await fetch("/api/sponsor-responses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsor_id: sponsorId,
          section: sectionNumber,
          responses: sectionResponses,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setSaveError("Não foi possível salvar. Tente novamente.");
        return false;
      }

      if (data.completed) {
        setIsCompleted(true);
      }

      return true;
    } catch {
      setSaveError("Erro de conexão.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // ── Navigate sections ─────────────────────────────────────────────────────

  const goNext = async () => {
    let extraResponses: Partial<SponsorFormResponses> | undefined;

    if (currentSection === 6) {
      const normalized = people.map((p) => ({
        ...p,
        whatsapp: normalizeWhatsapp(p.whatsapp),
      }));
      extraResponses = { s6_key_people: normalized };
      setResponses((prev) => ({ ...prev, s6_key_people: normalized }));
    }

    const ok = await saveSection(currentSection, extraResponses);
    if (!ok) return;

    if (currentSection < 6) {
      setCurrentSection((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setIsCompleted(true);
    }
  };

  const goBack = () => {
    if (currentSection > 1) {
      setCurrentSection((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Validate current section ──────────────────────────────────────────────

  const isSectionValid = () => {
    switch (currentSection) {
      case 1:
        return (
          responses.s1_areas_ok !== undefined &&
          responses.s1_systems_ok !== undefined &&
          responses.s1_ai_ok !== undefined
        );
      case 2:
        return countWords(responses.s2_main_strength ?? "") >= 30;
      case 3:
        return responses.s3_integration_score !== undefined;
      case 4:
        return responses.s4_change_openness !== undefined;
      case 5:
        return countWords(responses.s5_success_criteria ?? "") >= 30;
      case 6: {
        const validPeople = people.filter(
          (p) => p.nome.trim() && p.cargo.trim() && p.area.trim() && p.whatsapp.trim()
        );
        return validPeople.length >= 3 && responses.s6_contact_preference !== undefined;
      }
      default:
        return true;
    }
  };

  // ── Completion screen ─────────────────────────────────────────────────────

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}>
        <div className="dl-card p-8 max-w-md w-full text-center space-y-5 dl-fade-up-1">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "hsl(var(--color-dl-success) / 0.12)" }}>
            <svg className="w-7 h-7" style={{ color: "hsl(var(--color-dl-success))" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)", color: "hsl(var(--color-dl-text))" }}>
              Obrigado, {primeiroNome}!
            </h2>
            <p className="text-sm mt-2" style={{ color: "hsl(var(--color-dl-muted))" }}>
              Suas respostas são a base de tudo que vamos construir para a {empresaNome}.
            </p>
            <p className="text-sm mt-3" style={{ color: "hsl(var(--color-dl-muted))" }}>
              Nos próximos dias, o Diego — nosso Product Manager — vai entrar em contato com as pessoas-chave que você indicou para dar início às entrevistas do Diagnóstico 360.
            </p>
            <p className="text-sm mt-3" style={{ color: "hsl(var(--color-dl-muted))" }}>
              Se surgir qualquer dúvida, é só chamar.
            </p>
          </div>
          <p className="text-xs font-semibold" style={{ color: "hsl(var(--color-dl-primary))", letterSpacing: "0.05em" }}>
            TIME DALTON LAB
          </p>
        </div>
      </div>
    );
  }

  // ── Welcome screen ────────────────────────────────────────────────────────

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}>
        <div className="dl-card p-8 max-w-lg w-full space-y-5 dl-fade-up-1">
          <p className="dl-eyebrow">Dalton Lab</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)", color: "hsl(var(--color-dl-text))" }}>
            Bem-vindo ao Programa de Transformação Agêntica, {primeiroNome}.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--color-dl-muted))" }}>
            Este formulário é a primeira etapa do Diagnóstico 360 — o mapeamento que vai direcionar todo o plano de implementação de IA na <strong style={{ color: "hsl(var(--color-dl-text))" }}>{empresaNome}</strong>.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--color-dl-muted))" }}>
            Muito do contexto da empresa já foi compartilhado na nossa conversa comercial. Aqui, vamos aprofundar alguns pontos que ainda precisamos para montar um plano preciso.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--color-dl-muted))" }}>
            Não tem resposta certa ou errada — quanto mais contexto, melhor. Você pode responder por texto ou por áudio, no seu ritmo.
          </p>
          <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(var(--color-dl-muted))" }}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tempo estimado: 10-15 minutos
          </div>
          <button onClick={() => setShowWelcome(false)} className="dl-btn-primary w-full">
            Começar
          </button>
        </div>
      </div>
    );
  }

  // ── Section layout ────────────────────────────────────────────────────────

  const sectionIntros: Record<number, string> = {
    1: `Com base na nossa conversa inicial, entendemos o seguinte sobre a ${empresaNome}. Por favor, confirme ou corrija.`,
    2: "Antes de falar de oportunidades, queremos entender o que já funciona bem. Isso nos ajuda a proteger o que dá certo e a usar como referência.",
    3: "Agora queremos entender com mais detalhe como as coisas funcionam na prática.",
    4: "Entender como o time recebe mudanças é essencial para planejarmos a implementação da forma certa.",
    5: "Essas respostas vão nos ajudar a calibrar o plano para entregar exatamente o que importa para você.",
    6: `Para darmos início ao Diagnóstico 360, precisamos conversar com as pessoas que mais conhecem o dia a dia das áreas que vamos trabalhar. Serão conversas rápidas (15 minutos), por WhatsApp, no ritmo de cada um.`,
  };

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}>
      <div className="max-w-xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="dl-bar sticky top-0 z-10 rounded-2xl p-4 dl-card">
          <div className="flex items-center justify-between mb-3">
            <p className="dl-eyebrow">Dalton Lab</p>
            <p className="text-xs" style={{ color: "hsl(var(--color-dl-muted))" }}>{empresaNome}</p>
          </div>
          <SponsorProgress current={currentSection} />
        </div>

        {/* ── Section intro ── */}
        <div className="dl-fade-up-1">
          <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--color-dl-muted))" }}>
            {sectionIntros[currentSection]}
          </p>
        </div>

        {/* ── Section content ── */}
        <div className="space-y-4 dl-fade-up-2">

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 1 — Quick Validation
          ═══════════════════════════════════════════════════════════════ */}
          {currentSection === 1 && (
            <>
              <ValidationField
                label="1.1 Principais áreas da empresa"
                prefilled={briefingAreas}
                confirmed={responses.s1_areas_ok}
                correction={responses.s1_areas_correction}
                onConfirm={(v) => update("s1_areas_ok", v)}
                onCorrectionChange={(v) => update("s1_areas_correction", v)}
              />
              <ValidationField
                label="1.2 Principais sistemas e ferramentas em uso"
                prefilled={briefingSystems}
                confirmed={responses.s1_systems_ok}
                correction={responses.s1_systems_correction}
                onConfirm={(v) => update("s1_systems_ok", v)}
                onCorrectionChange={(v) => update("s1_systems_correction", v)}
              />
              <ValidationField
                label="1.3 Uso atual de IA"
                prefilled={briefingAiUsage}
                confirmed={responses.s1_ai_ok}
                correction={responses.s1_ai_correction}
                onConfirm={(v) => update("s1_ai_ok", v)}
                onCorrectionChange={(v) => update("s1_ai_correction", v)}
              />
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 2 — What Works Well
          ═══════════════════════════════════════════════════════════════ */}
          {currentSection === 2 && (
            <>
              <FieldWithAudio
                label={`2.1 Qual é a maior fortaleza operacional da ${empresaNome} hoje?`}
                hint="Aquilo que vocês fazem melhor do que a maioria."
                value={responses.s2_main_strength ?? ""}
                onChange={(v) => update("s2_main_strength", v)}
              />
              <FieldWithAudio
                label="2.2 Tem alguma área ou processo que funciona muito bem e poderia servir de referência?"
                value={responses.s2_reference_process ?? ""}
                onChange={(v) => update("s2_reference_process", v)}
              />
              <FieldWithAudio
                label="2.3 A empresa implementou alguma melhoria recente que trouxe resultado positivo?"
                hint="Tecnologia, processo, contratação — qualquer coisa."
                value={responses.s2_recent_improvement ?? ""}
                onChange={(v) => update("s2_recent_improvement", v)}
              />
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 3 — Operational Depth
          ═══════════════════════════════════════════════════════════════ */}
          {currentSection === 3 && (
            <>
              {/* Integration score */}
              <div className="dl-card p-4 space-y-3">
                <label className="dl-label">
                  3.1 Quão satisfeito você está com o nível de integração entre as ferramentas que a empresa usa?
                </label>
                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <label
                      key={score}
                      className={`dl-option-card${responses.s3_integration_score === score ? " selected" : ""}`}
                      onClick={() => update("s3_integration_score", score)}
                    >
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: responses.s3_integration_score === score ? "hsl(var(--color-dl-primary))" : "hsl(var(--color-dl-border))" }}>
                        {responses.s3_integration_score === score && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--color-dl-primary))" }} />
                        )}
                      </div>
                      <span className="text-sm">
                        <strong>{score}</strong> — {INTEGRATION_SCORE_LABELS[score]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <FieldWithAudio
                label="3.2 Quando o time precisa tomar uma decisão operacional rápida, a informação certa está acessível?"
                hint="Geralmente falta algum dado, relatório ou visibilidade?"
                value={responses.s3_data_visibility ?? ""}
                onChange={(v) => update("s3_data_visibility", v)}
              />
              <FieldWithAudio
                label="3.3 Existe algum processo que você sabe que precisa melhorar, mas ainda não conseguiu priorizar?"
                hint="O que impediu até agora?"
                value={responses.s3_unresolved_process ?? ""}
                onChange={(v) => update("s3_unresolved_process", v)}
              />
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 4 — Team and Culture
          ═══════════════════════════════════════════════════════════════ */}
          {currentSection === 4 && (
            <>
              {/* Change openness */}
              <div className="dl-card p-4 space-y-3">
                <label className="dl-label">
                  4.1 Como você avalia a abertura do seu time para adotar novas ferramentas e formas de trabalho?
                </label>
                <div className="flex flex-col gap-2">
                  {CHANGE_OPENNESS_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`dl-option-card${responses.s4_change_openness === opt.value ? " selected" : ""}`}
                      onClick={() => update("s4_change_openness", opt.value)}
                    >
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: responses.s4_change_openness === opt.value ? "hsl(var(--color-dl-primary))" : "hsl(var(--color-dl-border))" }}>
                        {responses.s4_change_openness === opt.value && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--color-dl-primary))" }} />
                        )}
                      </div>
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <FieldWithAudio
                label='4.2 Existe alguém no time que é naturalmente um "champion" de tecnologia ou inovação?'
                hint="Aquela pessoa que já testa coisas novas por conta. Se sim, quem é e em qual área?"
                value={responses.s4_tech_champion ?? ""}
                onChange={(v) => update("s4_tech_champion", v)}
              />

              {/* People challenges checkboxes */}
              <div className="dl-card p-4 space-y-3">
                <label className="dl-label">
                  4.3 Qual é o maior desafio de gestão de pessoas que impacta a operação hoje?
                </label>
                <p className="text-xs" style={{ color: "hsl(var(--color-dl-muted))" }}>
                  Marque até 2 opções
                </p>
                <div className="flex flex-col gap-2">
                  {PEOPLE_CHALLENGES.map((challenge) => {
                    const selected = (responses.s4_people_challenges ?? []).includes(challenge);
                    const maxReached = (responses.s4_people_challenges ?? []).length >= 2 && !selected;
                    return (
                      <label
                        key={challenge}
                        className={`dl-option-card${selected ? " selected" : ""}${maxReached ? " opacity-40 cursor-not-allowed" : ""}`}
                        onClick={() => !maxReached && toggleChallenge(challenge)}
                      >
                        <div className={`dl-check-indicator${selected ? " checked" : ""}`}>
                          {selected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm">{challenge}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 5 — Expectations
          ═══════════════════════════════════════════════════════════════ */}
          {currentSection === 5 && (
            <>
              <FieldWithAudio
                label="5.1 O que seria um resultado excepcional para você ao final do programa?"
                hint="Como você vai saber que valeu a pena?"
                value={responses.s5_success_criteria ?? ""}
                onChange={(v) => update("s5_success_criteria", v)}
                rows={5}
              />
              <FieldWithAudio
                label="5.2 Existe alguma preocupação ou receio que você tem sobre o processo?"
                hint="Algo que devemos ter cuidado especial?"
                value={responses.s5_concerns ?? ""}
                onChange={(v) => update("s5_concerns", v)}
              />
              <FieldWithAudio
                label="5.3 Quem são as pessoas que precisam estar convencidas do valor do programa para ele ter sucesso?"
                hint="Ex: CFO, diretor de operações, líder de TI, gestor de área específica..."
                value={responses.s5_key_stakeholders ?? ""}
                onChange={(v) => update("s5_key_stakeholders", v)}
              />
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 6 — Key People
          ═══════════════════════════════════════════════════════════════ */}
          {currentSection === 6 && (
            <>
              {/* People table */}
              <div className="dl-card p-4 space-y-4">
                <div>
                  <label className="dl-label">6.1 Indique de 3 a 5 pessoas-chave</label>
                  <p className="text-xs mt-1" style={{ color: "hsl(var(--color-dl-muted))" }}>
                    Serão conversas de 15 minutos, por WhatsApp, no ritmo de cada um.
                  </p>
                </div>

                <div className="space-y-3">
                  {people.map((person, index) => (
                    <div key={index} className="rounded-xl p-3 space-y-2" style={{ border: "1px solid hsl(var(--color-dl-border))" }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: "hsl(var(--color-dl-muted))" }}>
                          Pessoa {index + 1}
                        </span>
                        {index >= 3 && (
                          <button
                            type="button"
                            onClick={() => setPeople((prev) => prev.filter((_, i) => i !== index))}
                            className="text-xs"
                            style={{ color: "hsl(var(--color-dl-error))" }}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium block mb-1" style={{ color: "hsl(var(--color-dl-muted))" }}>Nome</label>
                          <input
                            type="text"
                            value={person.nome}
                            onChange={(e) => updatePerson(index, "nome", e.target.value)}
                            placeholder="Nome completo"
                            className="dl-input text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium block mb-1" style={{ color: "hsl(var(--color-dl-muted))" }}>Cargo</label>
                          <input
                            type="text"
                            value={person.cargo}
                            onChange={(e) => updatePerson(index, "cargo", e.target.value)}
                            placeholder="Ex: Gerente de Vendas"
                            className="dl-input text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium block mb-1" style={{ color: "hsl(var(--color-dl-muted))" }}>Área</label>
                          <input
                            type="text"
                            value={person.area}
                            onChange={(e) => updatePerson(index, "area", e.target.value)}
                            placeholder="Ex: Comercial"
                            className="dl-input text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium block mb-1" style={{ color: "hsl(var(--color-dl-muted))" }}>WhatsApp</label>
                          <input
                            type="tel"
                            value={person.whatsapp}
                            onChange={(e) => updatePerson(index, "whatsapp", e.target.value)}
                            placeholder="11999999999"
                            className="dl-input text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {people.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setPeople((prev) => [...prev, emptyPerson()])}
                    className="w-full py-2.5 rounded-xl text-sm transition-colors"
                    style={{ border: "2px dashed hsl(var(--color-dl-border))", color: "hsl(var(--color-dl-muted))" }}
                  >
                    + Adicionar outra pessoa
                  </button>
                )}
              </div>

              {/* Contact preference */}
              <div className="dl-card p-4 space-y-3">
                <label className="dl-label">6.2 Você prefere que a gente entre em contato diretamente com essas pessoas?</label>
                <div className="flex flex-col gap-2">
                  {CONTACT_PREFERENCE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`dl-option-card${responses.s6_contact_preference === opt.value ? " selected" : ""}`}
                      onClick={() => update("s6_contact_preference", opt.value)}
                    >
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: responses.s6_contact_preference === opt.value ? "hsl(var(--color-dl-primary))" : "hsl(var(--color-dl-border))" }}>
                        {responses.s6_contact_preference === opt.value && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--color-dl-primary))" }} />
                        )}
                      </div>
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <FieldWithAudio
                label="6.3 Tem alguma observação sobre alguma dessas pessoas que devemos saber?"
                hint='Ex: "O João está de férias até dia X", "A Maria é mais reservada, talvez prefira responder por áudio"'
                value={responses.s6_people_notes ?? ""}
                onChange={(v) => update("s6_people_notes", v)}
              />
            </>
          )}
        </div>

        {/* ── Save error ── */}
        {saveError && (
          <div className="rounded-xl p-3 text-sm" style={{ backgroundColor: "hsl(var(--color-dl-error) / 0.08)", border: "1px solid hsl(var(--color-dl-error) / 0.25)", color: "hsl(var(--color-dl-error))" }}>
            {saveError}
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex gap-3 dl-fade-up-3">
          {currentSection > 1 && (
            <button onClick={goBack} disabled={isSaving} className="dl-btn-ghost flex-1">
              Voltar
            </button>
          )}
          <button
            onClick={goNext}
            disabled={!isSectionValid() || isSaving}
            className="dl-btn-primary flex-1"
          >
            {isSaving
              ? "Salvando..."
              : currentSection === 6
              ? "Enviar"
              : "Avançar"}
          </button>
        </div>

        {/* ── Toast ── */}
        {toast && <div className="dl-toast">{toast}</div>}
      </div>
    </div>
  );
}
