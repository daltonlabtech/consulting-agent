"use client";

import { useState, KeyboardEvent } from "react";
import { sponsorFormSchema } from "@/lib/validations";

// Normaliza qualquer formato de WhatsApp para +55XXXXXXXXXXX
function normalizeWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (!digits.startsWith("55") && digits.length >= 10) return `+55${digits}`;
  return value;
}

interface EntrevistadoForm {
  nome: string;
  cargo: string;
  area: string;
  whatsapp: string;
}

interface Props {
  initialValues?: {
    empresa?: string;
    nome_sponsor?: string;
    whatsapp_sponsor?: string;
  };
}

const createEmpty = (): EntrevistadoForm => ({
  nome: "",
  cargo: "",
  area: "",
  whatsapp: "",
});

export function SponsorForm({ initialValues = {} }: Props) {
  const [empresa, setEmpresa] = useState(initialValues.empresa ?? "");
  const [nomeSponsor, setNomeSponsor] = useState(initialValues.nome_sponsor ?? "");
  const [whatsappSponsor, setWhatsappSponsor] = useState(
    initialValues.whatsapp_sponsor ?? ""
  );
  const [areas, setAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState("");
  const [dataLimite, setDataLimite] = useState("");
  const [avisouTime, setAvisouTime] = useState(false);
  const [entrevistados, setEntrevistados] = useState<EntrevistadoForm[]>([
    createEmpty(),
    createEmpty(),
    createEmpty(),
  ]);

  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ count: number; nomes: string[] } | null>(
    null
  );
  const [apiError, setApiError] = useState("");

  // ─── Validation ────────────────────────────────────────────────────────────

  const formPayload = {
    empresa,
    nome_sponsor: nomeSponsor,
    whatsapp_sponsor: normalizeWhatsapp(whatsappSponsor),
    areas_contratadas: areas,
    data_limite: dataLimite || undefined,
    avisou_time: avisouTime,
    entrevistados: entrevistados.map((e) => ({
      ...e,
      whatsapp: normalizeWhatsapp(e.whatsapp),
    })),
  };

  const validation = sponsorFormSchema.safeParse(formPayload);
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

  // ─── Areas ─────────────────────────────────────────────────────────────────

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

  // ─── Entrevistados ─────────────────────────────────────────────────────────

  const updateEntrevistado = (
    index: number,
    field: keyof EntrevistadoForm,
    value: string
  ) => {
    setEntrevistados((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const addEntrevistado = () => {
    setEntrevistados((prev) => [...prev, createEmpty()]);
  };

  const removeEntrevistado = (index: number) => {
    if (entrevistados.length <= 3) return;
    setEntrevistados((prev) => prev.filter((_, i) => i !== index));
  };

  const whatsappCount = entrevistados.reduce(
    (acc, e) => {
      if (e.whatsapp) acc[e.whatsapp] = (acc[e.whatsapp] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const isDuplicate = (whatsapp: string) =>
    !!whatsapp && (whatsappCount[whatsapp] || 0) > 1;

  // ─── Submit ────────────────────────────────────────────────────────────────

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
          avisou_time: avisouTime,
          entrevistados: entrevistados.map((e) => ({
            ...e,
            whatsapp: normalizeWhatsapp(e.whatsapp),
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess({
          count: entrevistados.length,
          nomes: entrevistados.map((e) => e.nome),
        });
      } else {
        setApiError(data.error || "Erro ao cadastrar. Tente novamente.");
      }
    } catch {
      setApiError("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success screen ────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tudo pronto!</h2>
          <p className="text-gray-500 mb-6">
            {success.count} entrevistado{success.count !== 1 ? "s" : ""} cadastrado
            {success.count !== 1 ? "s" : ""} com sucesso.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Entrevistados cadastrados:
            </p>
            <ul className="space-y-2">
              {success.nomes.map((nome, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-semibold shrink-0">
                    {i + 1}
                  </span>
                  {nome}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-400">
            Eles receberão o link do diagnóstico via WhatsApp em breve.
          </p>
        </div>
      </div>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────────────

  const inputBase =
    "w-full px-4 py-3 rounded-xl border text-base transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const inputNormal = "border-gray-200 bg-white";
  const inputError = "border-red-300 bg-red-50";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
            Dalton Lab
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Diagnóstico 360°</h1>
          <p className="text-gray-500 mt-1">
            Cadastre os dados da empresa e os entrevistados que participarão.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Dados do sponsor ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              Dados do sponsor
            </h2>

            <div className="space-y-4">
              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome da empresa <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  onBlur={() => touch("empresa")}
                  placeholder="Ex: Acme Ltda"
                  className={`${inputBase} ${showError("empresa") ? inputError : inputNormal}`}
                />
                {showError("empresa") && (
                  <p className="text-red-500 text-sm mt-1">{showError("empresa")}</p>
                )}
              </div>

              {/* Nome sponsor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Seu nome <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={nomeSponsor}
                  onChange={(e) => setNomeSponsor(e.target.value)}
                  onBlur={() => touch("nome_sponsor")}
                  placeholder="Ex: João Silva"
                  className={`${inputBase} ${showError("nome_sponsor") ? inputError : inputNormal}`}
                />
                {showError("nome_sponsor") && (
                  <p className="text-red-500 text-sm mt-1">
                    {showError("nome_sponsor")}
                  </p>
                )}
              </div>

              {/* WhatsApp sponsor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Seu WhatsApp <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={whatsappSponsor}
                  onChange={(e) => setWhatsappSponsor(e.target.value)}
                  onBlur={() => touch("whatsapp_sponsor")}
                  placeholder="+5511999999999"
                  className={`${inputBase} ${showError("whatsapp_sponsor") ? inputError : inputNormal}`}
                />
                <p className="text-xs text-gray-400 mt-1">Ex: 11999999999 ou +5511999999999</p>
                {showError("whatsapp_sponsor") && (
                  <p className="text-red-500 text-sm mt-1">
                    {showError("whatsapp_sponsor")}
                  </p>
                )}
              </div>

              {/* Data limite */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Data limite para conclusão <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={dataLimite}
                  onChange={(e) => setDataLimite(e.target.value)}
                  onBlur={() => touch("data_limite")}
                  min={new Date().toISOString().split("T")[0]}
                  className={`${inputBase} ${showError("data_limite") ? inputError : inputNormal}`}
                />
                {showError("data_limite") && (
                  <p className="text-red-500 text-sm mt-1">
                    {showError("data_limite")}
                  </p>
                )}
              </div>

              {/* Áreas contratadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Áreas contratadas <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    onKeyDown={handleAreaKeyDown}
                    onBlur={() => {
                      if (areas.length === 0) touch("areas_contratadas");
                    }}
                    placeholder="Ex: Marketing"
                    className={`${inputBase} ${inputNormal}`}
                  />
                  <button
                    type="button"
                    onClick={addArea}
                    className="px-5 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors shrink-0"
                  >
                    Adicionar
                  </button>
                </div>
                {areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {areas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() =>
                            setAreas((prev) => prev.filter((a) => a !== area))
                          }
                          className="text-indigo-400 hover:text-indigo-600 transition-colors leading-none"
                          aria-label={`Remover ${area}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {touched.has("areas_contratadas") && areas.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    Adicione ao menos uma área
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Entrevistados ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Entrevistados
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">Mínimo 3 pessoas</p>
              </div>
              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full shrink-0">
                {entrevistados.length}{" "}
                {entrevistados.length === 1 ? "cadastrado" : "cadastrados"}
              </span>
            </div>

            <div className="space-y-3">
              {entrevistados.map((entrevistado, index) => {
                const tKey = (f: string) => `entrevistados.${index}.${f}`;
                const fieldError = (f: keyof EntrevistadoForm) =>
                  touched.has(tKey(f)) && !entrevistado[f];
                const whatsappDup =
                  touched.has(tKey("whatsapp")) &&
                  isDuplicate(entrevistado.whatsapp);
                const whatsappInvalid =
                  touched.has(tKey("whatsapp")) && !entrevistado.whatsapp;

                return (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        Entrevistado {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEntrevistado(index)}
                        disabled={entrevistados.length <= 3}
                        className={`text-sm transition-colors ${
                          entrevistados.length <= 3
                            ? "text-gray-200 cursor-not-allowed"
                            : "text-red-400 hover:text-red-600"
                        }`}
                      >
                        Remover
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Nome */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Nome <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={entrevistado.nome}
                          onChange={(e) =>
                            updateEntrevistado(index, "nome", e.target.value)
                          }
                          onBlur={() => touch(tKey("nome"))}
                          placeholder="Nome completo"
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            fieldError("nome")
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>

                      {/* Cargo */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Cargo <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={entrevistado.cargo}
                          onChange={(e) =>
                            updateEntrevistado(index, "cargo", e.target.value)
                          }
                          onBlur={() => touch(tKey("cargo"))}
                          placeholder="Ex: Gerente de Vendas"
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            fieldError("cargo")
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>

                      {/* Área */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Área <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={entrevistado.area}
                          onChange={(e) =>
                            updateEntrevistado(index, "area", e.target.value)
                          }
                          onBlur={() => touch(tKey("area"))}
                          placeholder="Ex: Comercial"
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            fieldError("area")
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          WhatsApp <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          value={entrevistado.whatsapp}
                          onChange={(e) =>
                            updateEntrevistado(
                              index,
                              "whatsapp",
                              e.target.value
                            )
                          }
                          onBlur={() => touch(tKey("whatsapp"))}
                          placeholder="+5511999999999"
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            whatsappInvalid || whatsappDup
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          }`}
                        />
                        <p className="text-xs text-gray-400 mt-1">Ex: 11999999999</p>
                        {whatsappDup && (
                          <p className="text-red-500 text-xs mt-1">
                            WhatsApp duplicado
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addEntrevistado}
              className="mt-3 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              + Adicionar outro entrevistado
            </button>
          </div>

          {/* ── Confirmação ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={avisouTime}
                onChange={(e) => setAvisouTime(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                Você já avisou o time que eles receberão mensagem do Dalton?
              </span>
            </label>
          </div>

          {/* ── Pendências de validação ── */}
          {!isValid && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
              <p className="font-medium mb-2">Antes de enviar, verifique:</p>
              {validation.error.issues.slice(0, 5).map((issue, i) => {
                const path = issue.path;
                let label = issue.message;
                if (path[0] === "empresa") label = 'Campo "Nome da empresa" inválido';
                else if (path[0] === "nome_sponsor") label = 'Campo "Seu nome" inválido';
                else if (path[0] === "whatsapp_sponsor") label = 'WhatsApp do sponsor inválido — use o formato +5511999999999';
                else if (path[0] === "areas_contratadas") label = 'Adicione ao menos uma área contratada';
                else if (path[0] === "data_limite") label = 'Data limite é obrigatória';
                else if (path[0] === "entrevistados" && typeof path[1] === "number") {
                  const idx = path[1] + 1;
                  if (path[2] === "whatsapp") label = `Entrevistado ${idx}: WhatsApp inválido — use +5511999999999`;
                  else if (path[2] === "nome") label = `Entrevistado ${idx}: Nome obrigatório`;
                  else if (path[2] === "cargo") label = `Entrevistado ${idx}: Cargo obrigatório`;
                  else if (path[2] === "area") label = `Entrevistado ${idx}: Área obrigatória`;
                } else if (path[0] === "entrevistados") {
                  label = issue.message;
                }
                return <p key={i} className="flex gap-2"><span>•</span>{label}</p>;
              })}
            </div>
          )}

          {/* ── Erro da API ── */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
              {apiError}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full py-4 rounded-xl text-base font-semibold transition-all ${
              isValid && !isSubmitting
                ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99] shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Enviando..." : "Cadastrar entrevistados"}
          </button>
        </form>
      </div>
    </div>
  );
}
