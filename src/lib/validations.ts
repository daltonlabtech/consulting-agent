import { z } from "zod";

const entrevistadoSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  cargo: z.string().min(1, "Cargo obrigatório"),
  area: z.string().min(1, "Área obrigatória"),
  whatsapp: z.string().regex(/^\+55\d{10,11}$/, "WhatsApp inválido"),
});

export const sponsorFormSchema = z.object({
  empresa: z.string().min(1, "Nome da empresa é obrigatório"),
  nome_sponsor: z.string().min(1, "Nome do sponsor é obrigatório"),
  whatsapp_sponsor: z
    .string()
    .regex(/^\+55\d{10,11}$/, "WhatsApp inválido"),
  areas_contratadas: z.array(z.string()).min(1, "Selecione ao menos uma área"),
  data_limite: z.coerce.date(),
  avisou_time: z.boolean(),
  entrevistados: z
    .array(entrevistadoSchema)
    .min(3, "Mínimo 3 entrevistados")
    .refine(
      (entrevistados) => {
        const whatsapps = entrevistados.map((e) => e.whatsapp);
        return new Set(whatsapps).size === whatsapps.length;
      },
      { message: "WhatsApps duplicados não são permitidos" }
    ),
});

export const respostasUpdateSchema = z.object({
  entrevistado_id: z.string().uuid(),
  secao: z.number().min(1).max(5),
  respostas: z.record(z.unknown()),
});

export type SponsorFormData = z.infer<typeof sponsorFormSchema>;
export type RespostasUpdateData = z.infer<typeof respostasUpdateSchema>;
