#!/usr/bin/env tsx
/**
 * Limpa dados de teste do banco
 * Uso: npm run db:reset
 */

import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🧹 Limpando dados de teste...\n");

  // Deleta entrevistados de empresas de teste
  const deletedEntrevistados = await prisma.entrevistado.deleteMany({
    where: {
      sponsor: {
        nome: {
          startsWith: "Empresa Teste",
        },
      },
    },
  });
  console.log(`🗑️  Deletados ${deletedEntrevistados.count} entrevistados de teste`);

  // Deleta sponsors de teste
  const deletedSponsors = await prisma.sponsor.deleteMany({
    where: {
      nome: {
        startsWith: "Empresa Teste",
      },
    },
  });
  console.log(`🗑️  Deletados ${deletedSponsors.count} sponsors de teste`);

  await prisma.$disconnect();
  console.log("\n✅ Reset concluído!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
