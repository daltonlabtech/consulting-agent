import { z } from "zod";

// ─── Sponsor setup (PM internal form) ────────────────────────────────────────

export const sponsorSetupSchema = z.object({
  empresa: z.string().min(1, "Nome da empresa é obrigatório"),
  nome_sponsor: z.string().min(1, "Nome do sponsor é obrigatório"),
  whatsapp_sponsor: z
    .string()
    .regex(/^\+55\d{10,11}$/, "WhatsApp inválido"),
  areas_contratadas: z.array(z.string()).min(1, "Selecione ao menos uma área"),
  data_limite: z.coerce.date(),
  // Briefing context for pre-filling CEO form
  briefing_areas: z.string().optional(),
  briefing_systems: z.string().optional(),
  briefing_ai_usage: z.string().optional(),
});

// ─── Sponsor diagnostic form responses (CEO form, per section) ───────────────

export const sponsorResponseSchema = z.object({
  sponsor_id: z.string().uuid(),
  section: z.number().min(1).max(6),
  responses: z.record(z.string(), z.unknown()),
});

// ─── Entrevistado form responses (Formulário 2/3, per section) ───────────────

export const respostasUpdateSchema = z.object({
  entrevistado_id: z.string().uuid(),
  secao: z.number().min(1).max(5),
  respostas: z.record(z.string(), z.unknown()),
});

// ─── Entrevistado creation (with tipo) ───────────────────────────────────────

export const entrevistadoCreateSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email().optional(),
  cargo: z.string().min(1, "Cargo é obrigatório"),
  area: z.string().min(1, "Área é obrigatória"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  sponsor_id: z.string().uuid(),
  tipo: z.enum(["gestor", "operador"]).default("operador"),
});

// ─── Exported types ───────────────────────────────────────────────────────────

export type SponsorSetupData = z.infer<typeof sponsorSetupSchema>;
export type SponsorResponseData = z.infer<typeof sponsorResponseSchema>;
export type RespostasUpdateData = z.infer<typeof respostasUpdateSchema>;
export type EntrevistadoCreateData = z.infer<typeof entrevistadoCreateSchema>;

// Legacy alias — kept for backward compatibility with existing imports
export const sponsorFormSchema = sponsorSetupSchema;
export type SponsorFormData = SponsorSetupData;
