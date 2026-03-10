#!/usr/bin/env tsx
/**
 * Executa código Prisma direto via arquivo temporário
 * Uso: npm run db:exec -- "prisma.sponsor.count()"
 */

import "dotenv/config";
import { writeFile, unlink } from "fs/promises";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const code = process.argv[2];

if (!code) {
  console.log("Uso: npm run db:exec -- \"<código>\"");
  console.log("");
  console.log("Exemplos:");
  console.log('  npm run db:exec -- "prisma.sponsor.count()"');
  console.log('  npm run db:exec -- "prisma.sponsor.findFirst()"');
  console.log('  npm run db:exec -- "db.entrevistado.findMany({ where: { status: \"concluido\" } })"');
  process.exit(1);
}

async function main() {
  // Cria arquivo temporário no root do projeto (onde tsconfig.json está)
  const rootDir = join(__dirname, "..");
  const tempFile = join(rootDir, `.temp-${Date.now()}.ts`);

  const scriptContent = `
import "dotenv/config";
import { prisma } from "./src/lib/prisma";

(async () => {
  try {
    const db = prisma;
    const result = await ${code};
    console.log(result);
    await prisma.\$disconnect();
  } catch (error) {
    console.error("❌ Erro:", error);
    await prisma.\$disconnect();
    process.exit(1);
  }
})();
`;

  await writeFile(tempFile, scriptContent);

  // Executa o arquivo temporário
  const child = spawn("npx", ["tsx", tempFile], {
    stdio: "inherit",
    shell: true,
    cwd: rootDir,
  });

  child.on("close", async (code) => {
    try {
      await unlink(tempFile);
    } catch {
      // ignora erro se arquivo já foi deletado
    }
    process.exit(code ?? 0);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
