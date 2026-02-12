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

export type StatusEntrevistado = "nao_iniciado" | "em_andamento" | "concluido";

export interface EntrevistadoInput {
  nome: string;
  cargo: string;
  area: string;
  whatsapp: string;
}
