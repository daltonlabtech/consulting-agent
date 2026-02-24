"use client";

import { useState, KeyboardEvent } from "react";
import { sponsorSetupSchema } from "@/lib/validations";

function normalizeWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (!digits.startsWith("55") && digits.length >= 10) return `+55${digits}`;
  return value;
}

interface Props {
  initialValues?: {
    empresa?: string;
    nome_sponsor?: string;
    whatsapp_sponsor?: string;
  };
}

export function SponsorForm({ initialValues = {} }: Props) {
  // ── Basic sponsor data ──────────────────────────────────────────────────────
  const [empresa, setEmpresa] = useState(initialValues.empresa ?? "");
  const [nomeSponsor, setNomeSponsor] = useState(initialValues.nome_sponsor ?? "");
  const [whatsappSponsor, setWhatsappSponsor] = useState(
    initialValues.whatsapp_sponsor ?? ""
  );
  const [areas, setAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState("");
  const [dataLimite, setDataLimite] = useState("");

  // ── Briefing context (pre-fill for CEO form) ────────────────────────────────
  const [briefingAreas, setBriefingAreas] = useState("");
  const [briefingSystems, setBriefingSystems] = useState("");
  const [briefingAiUsage, setBriefingAiUsage] = useState("");

  // ── UI state ────────────────────────────────────────────────────────────────
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ sponsorId: string } | null>(null);
  const [apiError, setApiError] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const formPayload = {
    empresa,
    nome_sponsor: nomeSponsor,
    whatsapp_sponsor: normalizeWhatsapp(whatsappSponsor),
    areas_contratadas: areas,
    data_limite: dataLimite || undefined,
    briefing_areas: briefingAreas || undefined,
    briefing_systems: briefingSystems || undefined,
    briefing_ai_usage: briefingAiUsage || undefined,
  };

  const validation = sponsorSetupSchema.safeParse(formPayload);
  const isValid = validation.success;

  const getZodError = (path: string): string | undefined => {
    if (!validation.success) {
      return validation.error.issues.find(
        (issue) => issue.path.join(".") === path
      )?.message;
    }
  };

  const showError = (field: string): string | undefined => {
    if (touched.has(field)) return getZodError(field);
  };

  const touch = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  };

  // ── Areas ───────────────────────────────────────────────────────────────────
  const addArea = () => {
    const trimmed = areaInput.trim();
    if (trimmed && !areas.includes(trimmed)) {
      setAreas((prev) => [...prev, trimmed]);
      setAreaInput("");
    }
  };

  const handleAreaKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addArea();
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa,
          nome_sponsor: nomeSponsor,
          whatsapp_sponsor: normalizeWhatsapp(whatsappSponsor),
          areas_contratadas: areas,
          data_limite: dataLimite,
          briefing_areas: briefingAreas || undefined,
          briefing_systems: briefingSystems || undefined,
          briefing_ai_usage: briefingAiUsage || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess({ sponsorId: data.sponsor.id });
      } else {
        setApiError(data.error || "Erro ao cadastrar. Tente novamente.");
      }
    } catch {
      setApiError("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    const formUrl = `${window.location.origin}/sponsor/${success.sponsorId}`;

    const copyLink = () => {
      navigator.clipboard.writeText(formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}>
        <div className="dl-card p-8 max-w-lg w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "hsl(var(--color-dl-success) / 0.12)" }}>
            <svg className="w-7 h-7" style={{ color: "hsl(var(--color-dl-success))" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-bold" style={{ color: "hsl(var(--color-dl-text))", fontFamily: "var(--font-space-grotesk)" }}>
              Sponsor cadastrado!
            </h2>
            <p className="mt-1 text-sm" style={{ color: "hsl(var(--color-dl-muted))" }}>
              Envie o link abaixo para o sponsor preencher o Formulário 1.
            </p>
          </div>

          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "hsl(var(--color-dl-bg))", border: "1px solid hsl(var(--color-dl-border))" }}>
            <p className="dl-eyebrow text-left">Link do formulário</p>
            <p className="text-sm break-all text-left font-mono" style={{ color: "hsl(var(--color-dl-text))" }}>
              {formUrl}
            </p>
          </div>

          <button
            onClick={copyLink}
            className="dl-btn-primary w-full"
          >
            {copied ? "Link copiado!" : "Copiar link"}
          </button>

          <button
            onClick={() => { setSuccess(null); }}
            className="dl-link-muted"
          >
            Cadastrar outro sponsor
          </button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  const inputBase = "dl-input";
  const inputError = "border-red-400 bg-red-50";

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="dl-eyebrow mb-1">Dalton Lab — Interno</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)", color: "hsl(var(--color-dl-text))" }}>
            Cadastro de Sponsor
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--color-dl-muted))" }}>
            Preencha os dados do cliente para gerar o link do Formulário 1.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Dados do sponsor ── */}
          <div className="dl-card p-6">
            <h2 className="font-semibold mb-5" style={{ color: "hsl(var(--color-dl-text))" }}>
              Dados do sponsor
            </h2>

            <div className="space-y-4">
              {/* Empresa */}
              <div>
                <label className="dl-label mb-1.5">
                  Nome da empresa <span style={{ color: "hsl(var(--color-dl-error))" }}>*</span>
                </label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  onBlur={() => touch("empresa")}
                  placeholder="Ex: Top Chairs"
                  className={`${inputBase} ${showError("empresa") ? inputError : ""}`}
                />
                {showError("empresa") && <p className="dl-error mt-1">{showError("empresa")}</p>}
              </div>

              {/* Nome sponsor */}
              <div>
                <label className="dl-label mb-1.5">
                  Nome do sponsor <span style={{ color: "hsl(var(--color-dl-error))" }}>*</span>
                </label>
                <input
                  type="text"
                  value={nomeSponsor}
                  onChange={(e) => setNomeSponsor(e.target.value)}
                  onBlur={() => touch("nome_sponsor")}
                  placeholder="Ex: Leandro Nunes"
                  className={`${inputBase} ${showError("nome_sponsor") ? inputError : ""}`}
                />
                {showError("nome_sponsor") && <p className="dl-error mt-1">{showError("nome_sponsor")}</p>}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="dl-label mb-1.5">
                  WhatsApp do sponsor <span style={{ color: "hsl(var(--color-dl-error))" }}>*</span>
                </label>
                <input
                  type="tel"
                  value={whatsappSponsor}
                  onChange={(e) => setWhatsappSponsor(e.target.value)}
                  onBlur={() => touch("whatsapp_sponsor")}
                  placeholder="+5519999999999"
                  className={`${inputBase} ${showError("whatsapp_sponsor") ? inputError : ""}`}
                />
                <p className="dl-error mt-1" style={{ color: "hsl(var(--color-dl-muted))", fontSize: "0.75rem" }}>
                  Ex: 19999999999 ou +5519999999999
                </p>
                {showError("whatsapp_sponsor") && <p className="dl-error mt-1">{showError("whatsapp_sponsor")}</p>}
              </div>

              {/* Data limite */}
              <div>
                <label className="dl-label mb-1.5">
                  Prazo para o sponsor preencher <span style={{ color: "hsl(var(--color-dl-error))" }}>*</span>
                </label>
                <input
                  type="date"
                  value={dataLimite}
                  onChange={(e) => setDataLimite(e.target.value)}
                  onBlur={() => touch("data_limite")}
                  min={new Date().toISOString().split("T")[0]}
                  className={`${inputBase} ${showError("data_limite") ? inputError : ""}`}
                />
                {showError("data_limite") && <p className="dl-error mt-1">{showError("data_limite")}</p>}
              </div>

              {/* Áreas contratadas */}
              <div>
                <label className="dl-label mb-1.5">
                  Áreas contratadas <span style={{ color: "hsl(var(--color-dl-error))" }}>*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    onKeyDown={handleAreaKeyDown}
                    onBlur={() => { if (areas.length === 0) touch("areas_contratadas"); }}
                    placeholder="Ex: Atendimento"
                    className={`${inputBase}`}
                  />
                  <button
                    type="button"
                    onClick={addArea}
                    className="px-4 py-3 rounded-xl text-sm font-medium shrink-0 transition-colors"
                    style={{ backgroundColor: "hsl(var(--color-dl-primary) / 0.1)", color: "hsl(var(--color-dl-primary-h))" }}
                  >
                    Adicionar
                  </button>
                </div>
                {areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {areas.map((area) => (
                      <span key={area} className="dl-pill">
                        {area}
                        <button
                          type="button"
                          onClick={() => setAreas((prev) => prev.filter((a) => a !== area))}
                          className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                          aria-label={`Remover ${area}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {touched.has("areas_contratadas") && areas.length === 0 && (
                  <p className="dl-error mt-1">Adicione ao menos uma área</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Contexto para pré-preenchimento ── */}
          <div className="dl-card p-6">
            <h2 className="font-semibold mb-1" style={{ color: "hsl(var(--color-dl-text))" }}>
              Contexto da reunião comercial
            </h2>
            <p className="text-sm mb-5" style={{ color: "hsl(var(--color-dl-muted))" }}>
              Essas informações vão pré-preencher a Seção 1 do Formulário 1 para o CEO validar.
            </p>

            <div className="space-y-4">
              {/* Briefing: áreas */}
              <div>
                <label className="dl-label mb-1.5">Principais áreas da empresa</label>
                <textarea
                  value={briefingAreas}
                  onChange={(e) => setBriefingAreas(e.target.value)}
                  rows={3}
                  placeholder="Ex: Fabricação, Comercial/Vendas, Atendimento ao Cliente (SAC), Marketing, Financeiro"
                  className="dl-input"
                />
              </div>

              {/* Briefing: sistemas */}
              <div>
                <label className="dl-label mb-1.5">Principais sistemas e ferramentas em uso</label>
                <textarea
                  value={briefingSystems}
                  onChange={(e) => setBriefingSystems(e.target.value)}
                  rows={3}
                  placeholder="Ex: ERP Totvs, CRM Salesforce, Google Workspace, WhatsApp Business"
                  className="dl-input"
                />
              </div>

              {/* Briefing: uso de IA */}
              <div>
                <label className="dl-label mb-1.5">Uso atual de IA</label>
                <textarea
                  value={briefingAiUsage}
                  onChange={(e) => setBriefingAiUsage(e.target.value)}
                  rows={3}
                  placeholder="Ex: Usam ChatGPT informalmente para redigir e-mails. Sem automações estruturadas."
                  className="dl-input"
                />
              </div>
            </div>
          </div>

          {/* ── Erros de validação ── */}
          {!isValid && (
            <div className="rounded-xl p-4 text-sm space-y-1" style={{ backgroundColor: "hsl(40 90% 50% / 0.08)", border: "1px solid hsl(40 90% 50% / 0.25)", color: "hsl(30 80% 35%)" }}>
              <p className="font-medium mb-2">Antes de enviar, verifique:</p>
              {validation.error.issues.slice(0, 4).map((issue, i) => {
                const path = issue.path;
                let label = issue.message;
                if (path[0] === "empresa") label = 'Campo "Nome da empresa" obrigatório';
                else if (path[0] === "nome_sponsor") label = 'Campo "Nome do sponsor" obrigatório';
                else if (path[0] === "whatsapp_sponsor") label = 'WhatsApp inválido — use +5519999999999';
                else if (path[0] === "areas_contratadas") label = 'Adicione ao menos uma área contratada';
                else if (path[0] === "data_limite") label = 'Data limite é obrigatória';
                return <p key={i} className="flex gap-2"><span>•</span>{label}</p>;
              })}
            </div>
          )}

          {/* ── Erro da API ── */}
          {apiError && (
            <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "hsl(var(--color-dl-error) / 0.08)", border: "1px solid hsl(var(--color-dl-error) / 0.25)", color: "hsl(var(--color-dl-error))" }}>
              {apiError}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="dl-btn-primary w-full"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar e gerar link"}
          </button>
        </form>
      </div>
    </div>
  );
}
