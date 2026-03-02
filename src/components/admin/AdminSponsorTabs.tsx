"use client";

import { useState } from "react";
import { SponsorFormResponses, SponsorKeyPerson } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Option label maps ────────────────────────────────────────────────────────

const CHANGE_OPENNESS_LABELS: Record<string, string> = {
  very_open: "Muito aberto — o time abraça mudanças rápido",
  open_guided: "Aberto, mas precisa de direcionamento e treinamento",
  resistant_adapts: "Resistente no início, mas se adapta depois de ver resultado",
  resistant: "Bastante resistente — mudanças são um desafio constante",
};

const CONTACT_PREFERENCE_LABELS: Record<string, string> = {
  direct_notified: "Podem entrar em contato direto — eu aviso o time por conta",
  direct_no_notice: "Podem entrar em contato direto — não precisa avisar",
  wait_for_me: "Prefiro avisar o time primeiro e depois libero o contato de vocês",
};

const INTEGRATION_SCORE_LABELS: Record<number, string> = {
  1: "Cada sistema é uma ilha, nada conversa",
  2: "Pouca integração, muito trabalho manual",
  3: "Algumas coisas conversam, outras não",
  4: "Boa integração, poucos gaps",
  5: "Tudo conversa entre si, fluxo contínuo",
};

const STATUS_CONFIG = {
  pending: { label: "Aguardando", bg: "hsl(215 16% 47% / 0.1)", color: "hsl(215 16% 47%)" },
  in_progress: { label: "Em andamento", bg: "hsl(38 92% 50% / 0.1)", color: "hsl(32 95% 44%)" },
  completed: { label: "Concluído", bg: "hsl(142 71% 45% / 0.1)", color: "hsl(142 71% 35%)" },
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "hsl(var(--color-dl-muted))" }}>
      {children}
    </p>
  );
}

function FieldValue({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "hsl(var(--color-dl-text))" }}>
      {children}
    </p>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function EmptyField() {
  return (
    <p className="text-sm italic" style={{ color: "hsl(var(--color-dl-muted))" }}>
      Não respondido
    </p>
  );
}

function SectionEmpty() {
  return (
    <p className="text-sm text-center py-10 italic" style={{ color: "hsl(var(--color-dl-muted))" }}>
      Esta seção ainda não foi respondida.
    </p>
  );
}

function ValidationItem({
  label,
  prefilled,
  ok,
  correction,
}: {
  label: string;
  prefilled?: string | null;
  ok?: boolean;
  correction?: string;
}) {
  if (ok === undefined) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <FieldLabel>{label}</FieldLabel>
        <span
          className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
          style={
            ok
              ? { backgroundColor: "hsl(142 71% 45% / 0.1)", color: "hsl(142 71% 35%)" }
              : { backgroundColor: "hsl(38 92% 50% / 0.1)", color: "hsl(32 95% 44%)" }
          }
        >
          {ok ? "Correto" : "Precisa de ajuste"}
        </span>
      </div>
      {prefilled && (
        <p className="text-sm leading-relaxed px-3 py-2 rounded-lg" style={{ backgroundColor: "hsl(var(--color-dl-primary) / 0.06)", border: "1px solid hsl(var(--color-dl-primary) / 0.15)", color: "hsl(var(--color-dl-text))" }}>
          {prefilled}
        </p>
      )}
      {!ok && correction && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium" style={{ color: "hsl(var(--color-dl-muted))" }}>Correção do sponsor:</p>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--color-dl-text))" }}>
            {correction}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Tab content panels ───────────────────────────────────────────────────────

function TabGeral({
  sponsor,
}: {
  sponsor: {
    nome: string;
    empresa: string;
    whatsapp: string;
    areas_contratadas: string[];
    data_limite: Date;
    form_status: string;
    form_started_at: Date | null;
    form_completed_at: Date | null;
    briefing_areas: string | null;
    briefing_systems: string | null;
    briefing_ai_usage: string | null;
  };
}) {
  const status =
    STATUS_CONFIG[sponsor.form_status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.pending;

  return (
    <div className="grid gap-6">
      <div className="dl-card p-6 grid sm:grid-cols-2 gap-5">
        <FieldBlock label="Nome">
          <FieldValue>{sponsor.nome}</FieldValue>
        </FieldBlock>
        <FieldBlock label="Empresa">
          <FieldValue>{sponsor.empresa}</FieldValue>
        </FieldBlock>
        <FieldBlock label="WhatsApp">
          <FieldValue>{sponsor.whatsapp}</FieldValue>
        </FieldBlock>
        <FieldBlock label="Prazo">
          <FieldValue>
            {format(new Date(sponsor.data_limite), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </FieldValue>
        </FieldBlock>
        <FieldBlock label="Áreas contratadas">
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {sponsor.areas_contratadas.map((area) => (
              <span
                key={area}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: "hsl(var(--color-dl-primary) / 0.08)",
                  color: "hsl(var(--color-dl-primary))",
                }}
              >
                {area}
              </span>
            ))}
          </div>
        </FieldBlock>
        <FieldBlock label="Status do formulário">
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              {status.label}
            </span>
          </div>
          {sponsor.form_started_at && (
            <p className="text-xs mt-1" style={{ color: "hsl(var(--color-dl-muted))" }}>
              Iniciado em {format(new Date(sponsor.form_started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          )}
          {sponsor.form_completed_at && (
            <p className="text-xs" style={{ color: "hsl(var(--color-dl-muted))" }}>
              Concluído em {format(new Date(sponsor.form_completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          )}
        </FieldBlock>
      </div>

      <div>
        <h3 className="font-semibold mb-3 font-display" style={{ color: "hsl(var(--color-dl-text))" }}>
          Briefing (pré-preenchido pelo PM)
        </h3>
        <div className="dl-card p-6 grid gap-5">
          <FieldBlock label="Principais áreas da empresa">
            {sponsor.briefing_areas ? <FieldValue>{sponsor.briefing_areas}</FieldValue> : <EmptyField />}
          </FieldBlock>
          <FieldBlock label="Sistemas e ferramentas">
            {sponsor.briefing_systems ? <FieldValue>{sponsor.briefing_systems}</FieldValue> : <EmptyField />}
          </FieldBlock>
          <FieldBlock label="Uso atual de IA">
            {sponsor.briefing_ai_usage ? <FieldValue>{sponsor.briefing_ai_usage}</FieldValue> : <EmptyField />}
          </FieldBlock>
        </div>
      </div>
    </div>
  );
}

function TabSecao1({
  r,
  briefingAreas,
  briefingSystems,
  briefingAiUsage,
}: {
  r: SponsorFormResponses;
  briefingAreas: string | null;
  briefingSystems: string | null;
  briefingAiUsage: string | null;
}) {
  const hasAny =
    r.s1_areas_ok !== undefined ||
    r.s1_systems_ok !== undefined ||
    r.s1_ai_ok !== undefined;

  if (!hasAny) return <SectionEmpty />;

  return (
    <div className="dl-card p-6 grid gap-5">
      <ValidationItem
        label="1.1 Principais áreas da empresa"
        prefilled={briefingAreas}
        ok={r.s1_areas_ok}
        correction={r.s1_areas_correction}
      />
      <ValidationItem
        label="1.2 Principais sistemas e ferramentas em uso"
        prefilled={briefingSystems}
        ok={r.s1_systems_ok}
        correction={r.s1_systems_correction}
      />
      <ValidationItem
        label="1.3 Uso atual de IA"
        prefilled={briefingAiUsage}
        ok={r.s1_ai_ok}
        correction={r.s1_ai_correction}
      />
    </div>
  );
}

function TabSecao2({ r }: { r: SponsorFormResponses }) {
  if (!r.s2_main_strength && !r.s2_reference_process && !r.s2_recent_improvement)
    return <SectionEmpty />;

  return (
    <div className="dl-card p-6 grid gap-5">
      <FieldBlock label="2.1 Maior fortaleza operacional">
        {r.s2_main_strength ? <FieldValue>{r.s2_main_strength}</FieldValue> : <EmptyField />}
      </FieldBlock>
      <FieldBlock label="2.2 Processo de referência">
        {r.s2_reference_process ? <FieldValue>{r.s2_reference_process}</FieldValue> : <EmptyField />}
      </FieldBlock>
      <FieldBlock label="2.3 Melhoria recente">
        {r.s2_recent_improvement ? <FieldValue>{r.s2_recent_improvement}</FieldValue> : <EmptyField />}
      </FieldBlock>
    </div>
  );
}

function TabSecao3({ r }: { r: SponsorFormResponses }) {
  if (
    r.s3_integration_score === undefined &&
    !r.s3_data_visibility &&
    !r.s3_unresolved_process
  )
    return <SectionEmpty />;

  return (
    <div className="dl-card p-6 grid gap-5">
      <FieldBlock label="3.1 Score de integração de sistemas">
        {r.s3_integration_score !== undefined ? (
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-bold font-display"
              style={{ color: "hsl(var(--color-dl-primary))" }}
            >
              {r.s3_integration_score}
            </span>
            <span className="text-sm" style={{ color: "hsl(var(--color-dl-text))" }}>
              {INTEGRATION_SCORE_LABELS[r.s3_integration_score] ?? "—"}
            </span>
          </div>
        ) : (
          <EmptyField />
        )}
      </FieldBlock>
      <FieldBlock label="3.2 Visibilidade de dados para decisão rápida">
        {r.s3_data_visibility ? <FieldValue>{r.s3_data_visibility}</FieldValue> : <EmptyField />}
      </FieldBlock>
      <FieldBlock label="3.3 Processo não priorizado">
        {r.s3_unresolved_process ? <FieldValue>{r.s3_unresolved_process}</FieldValue> : <EmptyField />}
      </FieldBlock>
    </div>
  );
}

function TabSecao4({ r }: { r: SponsorFormResponses }) {
  if (!r.s4_change_openness && !r.s4_tech_champion && !r.s4_people_challenges?.length)
    return <SectionEmpty />;

  return (
    <div className="dl-card p-6 grid gap-5">
      <FieldBlock label="4.1 Abertura do time para mudança">
        {r.s4_change_openness ? (
          <FieldValue>{CHANGE_OPENNESS_LABELS[r.s4_change_openness] ?? r.s4_change_openness}</FieldValue>
        ) : (
          <EmptyField />
        )}
      </FieldBlock>
      <FieldBlock label='4.2 "Champion" de tecnologia'>
        {r.s4_tech_champion ? <FieldValue>{r.s4_tech_champion}</FieldValue> : <EmptyField />}
      </FieldBlock>
      <FieldBlock label="4.3 Desafios de pessoas (até 2)">
        {r.s4_people_challenges?.length ? (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {r.s4_people_challenges.map((c) => (
              <span
                key={c}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: "hsl(var(--color-dl-accent) / 0.08)",
                  color: "hsl(var(--color-dl-accent))",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        ) : (
          <EmptyField />
        )}
      </FieldBlock>
    </div>
  );
}

function TabSecao5({ r }: { r: SponsorFormResponses }) {
  if (!r.s5_success_criteria && !r.s5_concerns && !r.s5_key_stakeholders)
    return <SectionEmpty />;

  return (
    <div className="dl-card p-6 grid gap-5">
      <FieldBlock label="5.1 Critério de sucesso">
        {r.s5_success_criteria ? <FieldValue>{r.s5_success_criteria}</FieldValue> : <EmptyField />}
      </FieldBlock>
      <FieldBlock label="5.2 Preocupações">
        {r.s5_concerns ? <FieldValue>{r.s5_concerns}</FieldValue> : <EmptyField />}
      </FieldBlock>
      <FieldBlock label="5.3 Stakeholders-chave">
        {r.s5_key_stakeholders ? <FieldValue>{r.s5_key_stakeholders}</FieldValue> : <EmptyField />}
      </FieldBlock>
    </div>
  );
}

function TabPessoas({
  r,
  entrevistados,
}: {
  r: SponsorFormResponses;
  entrevistados: { nome: string; cargo: string; area: string; whatsapp: string }[];
}) {
  const keyPeople = (r.s6_key_people ?? []) as SponsorKeyPerson[];
  const allPeople = keyPeople.length > 0 ? keyPeople : entrevistados;

  return (
    <div className="grid gap-6">
      <div>
        <h3 className="font-semibold mb-3 font-display" style={{ color: "hsl(var(--color-dl-text))" }}>
          Colaboradores indicados
        </h3>
        <div className="dl-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--color-dl-border))" }}>
                {["Nome", "Cargo", "Área", "WhatsApp"].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left font-semibold"
                    style={{ color: "hsl(var(--color-dl-muted))" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPeople.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center italic"
                    style={{ color: "hsl(var(--color-dl-muted))" }}
                  >
                    Nenhuma pessoa indicada ainda.
                  </td>
                </tr>
              )}
              {allPeople.map((p, i) => (
                <tr
                  key={i}
                  style={
                    i < allPeople.length - 1
                      ? { borderBottom: "1px solid hsl(var(--color-dl-border))" }
                      : {}
                  }
                >
                  <td className="px-5 py-3" style={{ color: "hsl(var(--color-dl-text))" }}>
                    {p.nome}
                  </td>
                  <td className="px-5 py-3" style={{ color: "hsl(var(--color-dl-muted))" }}>
                    {p.cargo}
                  </td>
                  <td className="px-5 py-3" style={{ color: "hsl(var(--color-dl-muted))" }}>
                    {p.area}
                  </td>
                  <td className="px-5 py-3" style={{ color: "hsl(var(--color-dl-muted))" }}>
                    {p.whatsapp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dl-card p-6 grid gap-5">
        <FieldBlock label="Preferência de contato">
          {r.s6_contact_preference ? (
            <FieldValue>
              {CONTACT_PREFERENCE_LABELS[r.s6_contact_preference] ?? r.s6_contact_preference}
            </FieldValue>
          ) : (
            <EmptyField />
          )}
        </FieldBlock>
        <FieldBlock label="Observações">
          {r.s6_people_notes ? <FieldValue>{r.s6_people_notes}</FieldValue> : <EmptyField />}
        </FieldBlock>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = "geral" | "s1" | "s2" | "s3" | "s4" | "s5" | "pessoas";

const TABS: { id: Tab; label: string }[] = [
  { id: "geral", label: "Visão Geral" },
  { id: "s1", label: "Seção 1" },
  { id: "s2", label: "Seção 2" },
  { id: "s3", label: "Seção 3" },
  { id: "s4", label: "Seção 4" },
  { id: "s5", label: "Seção 5" },
  { id: "pessoas", label: "Pessoas-chave" },
];

interface SponsorData {
  id: string;
  nome: string;
  empresa: string;
  whatsapp: string;
  areas_contratadas: string[];
  data_limite: Date;
  form_status: string;
  form_responses: unknown;
  form_started_at: Date | null;
  form_completed_at: Date | null;
  briefing_areas: string | null;
  briefing_systems: string | null;
  briefing_ai_usage: string | null;
  entrevistados: {
    nome: string;
    cargo: string;
    area: string;
    whatsapp: string;
  }[];
}

export function AdminSponsorTabs({ sponsor }: { sponsor: SponsorData }) {
  const [activeTab, setActiveTab] = useState<Tab>("geral");
  const r = (sponsor.form_responses ?? {}) as SponsorFormResponses;

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex gap-1 overflow-x-auto pb-px"
        style={{ borderBottom: "1px solid hsl(var(--color-dl-border))" }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative"
              style={{
                color: active
                  ? "hsl(var(--color-dl-primary))"
                  : "hsl(var(--color-dl-muted))",
                borderBottom: active
                  ? "2px solid hsl(var(--color-dl-primary))"
                  : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="pt-6">
        {activeTab === "geral" && <TabGeral sponsor={sponsor} />}
        {activeTab === "s1" && (
          <TabSecao1
            r={r}
            briefingAreas={sponsor.briefing_areas}
            briefingSystems={sponsor.briefing_systems}
            briefingAiUsage={sponsor.briefing_ai_usage}
          />
        )}
        {activeTab === "s2" && <TabSecao2 r={r} />}
        {activeTab === "s3" && <TabSecao3 r={r} />}
        {activeTab === "s4" && <TabSecao4 r={r} />}
        {activeTab === "s5" && <TabSecao5 r={r} />}
        {activeTab === "pessoas" && (
          <TabPessoas r={r} entrevistados={sponsor.entrevistados} />
        )}
      </div>
    </div>
  );
}
