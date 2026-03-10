#!/usr/bin/env tsx
/**
 * Console interativo tipo "rails c" para o Prisma
 * Uso: npm run db:console
 */

import "dotenv/config";
import { prisma } from "@/lib/prisma";
import repl from "repl";

console.log("🚀 Prisma Console");
console.log("=================");
console.log("Variáveis disponíveis:");
console.log("  prisma    -> PrismaClient");
console.log("  db        -> alias para prisma");
console.log("");
console.log("Modelos:");
console.log("  prisma.sponsor      (Sponsor)");
console.log("  prisma.entrevistado (Entrevistado)");
console.log("");
console.log("Exemplos:");
console.log("  await prisma.sponsor.findMany()");
console.log("  await prisma.entrevistado.count()");
console.log("  await prisma.sponsor.create({ data: { ... } })");
console.log("");

const replServer = repl.start({
  prompt: "prisma> ",
  useColors: true,
  useGlobal: true,
});

// Expõe o prisma no contexto do REPL
replServer.context.prisma = prisma;
replServer.context.db = prisma;

// Fecha a conexão ao sair
replServer.on("exit", async () => {
  console.log("\n👋 Fechando conexão com o banco...");
  await prisma.$disconnect();
  process.exit(0);
});
