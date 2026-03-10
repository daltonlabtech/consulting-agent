// ─── Entrevistado form responses (Formulário 2/3) ────────────────────────────

export interface Respostas {
  secao_1?: {
    p1_fluxo_principal: string;
    p2_pessoas_envolvidas: string;
  };
  secao_2?: {
    p3_gargalos: string;
    p4_impactos: string;
    p5_tarefas_repetitivas: string;
  };
  secao_3?: {
    p6_ferramentas: string;
    p7_tempo_ferramentas: string;
    p8a_tempo_planilhas?: string;
    p8b_limitacoes_sistema?: string;
  };
  secao_4?: {
    p9_usa_ia: "Sim" | "Não";
    p10a_ferramentas_ia?: string[];
    p10b_como_usa?: string;
    p11_por_que_nao?: string;
    p11_outro?: string;
  };
  secao_5?: {
    p10_metas: string;
    p11_cenario_ideal: string;
  };
}

// ─── Respostas específicas do formulário de gestores ─────────────────────────

export interface RespostasGestor {
  // Bloco 1 - Visão da Área
  visao_geral?: string;
  interdependencias?: string;

  // Bloco 2 - Desafios de Gestão
  principal_problema?: string;
  impacto_pratico?: string;
  atividade_repetitiva?: string;

  // Bloco 3 - Ferramentas
  sistemas_ferramentas?: string;
  integracao_sistemas?: string;        // Condicional
  tempo_planilhas?: string;            // Condicional

  // Bloco 4 - IA e Inovação
  uso_ia_equipe?: string;

  // Bloco 5 - Metas e Cenário Ideal
  metas_semestre?: string;
  assistente_perfeito?: string;
}

export type TipoEntrevistado = "gestor" | "operador";
export type StatusEntrevistado = "nao_iniciado" | "em_andamento" | "concluido";

export interface EntrevistadoInput {
  nome: string;
  cargo: string;
  area: string;
  whatsapp: string;
}

// ─── Sponsor diagnostic form responses (Formulário 1 — CEO) ─────────────────

export interface SponsorKeyPerson {
  nome: string;
  cargo: string;
  area: string;
  whatsapp: string;
}

export interface SponsorFormResponses {
  // Section 1 — Quick validation
  s1_areas_ok?: boolean;
  s1_areas_correction?: string;
  s1_systems_ok?: boolean;
  s1_systems_correction?: string;
  s1_ai_ok?: boolean;
  s1_ai_correction?: string;

  // Section 2 — What works well
  s2_main_strength?: string;
  s2_reference_process?: string;
  s2_recent_improvement?: string;

  // Section 3 — Operational depth
  s3_integration_score?: number; // 1–5
  s3_data_visibility?: string;
  s3_unresolved_process?: string;

  // Section 4 — Team and culture
  s4_change_openness?: string;
  s4_tech_champion?: string;
  s4_people_challenges?: string[];

  // Section 5 — Expectations and success criteria
  s5_success_criteria?: string;
  s5_concerns?: string;
  s5_key_stakeholders?: string;

  // Section 6 — Key people for diagnosis
  s6_key_people?: SponsorKeyPerson[];
  s6_contact_preference?: string;
  s6_people_notes?: string;
}

export type SponsorFormStatus = "pending" | "in_progress" | "completed";
