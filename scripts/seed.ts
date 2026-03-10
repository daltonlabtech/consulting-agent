#!/usr/bin/env tsx
/**
 * Cria dados de teste no banco
 * Uso: npm run db:seed
 */

import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Criando dados de teste...\n");

  // Cria sponsors de teste
  const sponsors = await Promise.all([
    prisma.sponsor.create({
      data: {
        nome: "Empresa Teste Alpha",
        empresa: "Empresa Alpha Ltda",
        whatsapp: "5511999990001",
        areas_contratadas: ["consultoria", "agente_1"],
        data_limite: new Date("2025-12-31"),
        form_status: "pending",
        form_responses: {},
      },
    }),
    prisma.sponsor.create({
      data: {
        nome: "Empresa Teste Beta",
        empresa: "Empresa Beta Ltda",
        whatsapp: "5511999990002",
        areas_contratadas: ["consultoria"],
        data_limite: new Date("2025-12-31"),
        form_status: "in_progress",
        form_responses: { secao1: { resposta: "teste" } },
      },
    }),
    prisma.sponsor.create({
      data: {
        nome: "Empresa Teste Gamma",
        empresa: "Empresa Gamma Ltda",
        whatsapp: "5511999990003",
        areas_contratadas: ["agente_2"],
        data_limite: new Date("2025-12-31"),
        form_status: "completed",
        form_responses: { secao1: { resposta: "completo" }, secao2: { resposta: "completo" } },
      },
    }),
  ]);

  console.log(`✅ Criados ${sponsors.length} sponsors:`);
  sponsors.forEach((s) => console.log(`   - ${s.nome} (${s.form_status})`));

  // Cria entrevistados de teste vinculados ao primeiro sponsor
  const entrevistados = await Promise.all([
    prisma.entrevistado.create({
      data: {
        sponsor_id: sponsors[0].id,
        nome: "Gestor 1",
        cargo: "Diretor de Operações",
        area: "Operações",
        whatsapp: "5511999991001",
        tipo: "gestor",
        status: "nao_iniciado",
        respostas: {},
      },
    }),
    prisma.entrevistado.create({
      data: {
        sponsor_id: sponsors[0].id,
        nome: "Operador 1",
        cargo: "Analista",
        area: "Financeiro",
        whatsapp: "5511999991002",
        tipo: "operador",
        status: "em_andamento",
        respostas: { secao1: { resposta: "parcial" } },
      },
    }),
  ]);

  console.log(`\n✅ Criados ${entrevistados.length} entrevistados`);

  await prisma.$disconnect();
  console.log("\n🎉 Seed concluído!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
