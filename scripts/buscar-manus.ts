import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Buscando sponsors...');

  const sponsors = await prisma.sponsor.findMany({
    where: {
      empresa: {
        contains: 'Manus',
        mode: 'insensitive'
      }
    }
  });

  console.log('Sponsors encontrados:', sponsors.length);
  console.log(JSON.stringify(sponsors, null, 2));
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
