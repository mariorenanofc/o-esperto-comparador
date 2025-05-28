
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed data inicial se necessário
  console.log('Seeding database...')
  
  // Criar algumas lojas de exemplo
  const store1 = await prisma.store.upsert({
    where: { name: 'Mercado Bom Preço' },
    update: {},
    create: {
      name: 'Mercado Bom Preço',
    },
  })

  const store2 = await prisma.store.upsert({
    where: { name: 'Mercado Economia' },
    update: {},
    create: {
      name: 'Mercado Economia',
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
