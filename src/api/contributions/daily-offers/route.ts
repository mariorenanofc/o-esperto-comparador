
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar ofertas do dia
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const whereClause: any = {
      createdAt: {
        gte: today,
        lt: tomorrow
      },
      status: 'approved'
    };

    // Filtrar por localização se fornecida
    if (city && state) {
      // Buscar contribuições com produtos/lojas que contenham informações de localização
      // Isso seria melhor implementado com uma tabela separada para localizações
      whereClause.OR = [
        {
          product: {
            name: {
              contains: city,
              mode: 'insensitive'
            }
          }
        },
        {
          store: {
            name: {
              contains: city,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    const contributions = await prisma.priceContribution.findMany({
      where: whereClause,
      include: {
        product: true,
        store: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transformar para o formato DailyOffer
    const dailyOffers = contributions.map(contribution => ({
      id: contribution.id,
      productName: contribution.product.name,
      price: Number(contribution.price),
      storeName: contribution.store.name,
      city: city || 'Não especificado',
      state: state || 'N/A',
      contributorName: contribution.user?.name || 'Usuário Anônimo',
      userId: contribution.userId,
      timestamp: contribution.createdAt,
      verified: true // Apenas contribuições aprovadas são retornadas
    }));

    return NextResponse.json(dailyOffers);
  } catch (error) {
    console.error('Error fetching daily offers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar nova oferta do dia
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productName, storeName, price, quantity, unit, city, state } = await request.json();

    // Normalizar nomes para comparação
    const normalizeString = (str: string) => 
      str.toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Buscar produto similar
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: productName,
          mode: 'insensitive'
        }
      }
    });

    let product = products.find(p => 
      normalizeString(p.name) === normalizeString(productName) &&
      p.quantity === quantity &&
      p.unit === unit
    );

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: productName,
          quantity,
          unit
        }
      });
    }

    // Buscar loja similar
    const stores = await prisma.store.findMany({
      where: {
        name: {
          contains: storeName,
          mode: 'insensitive'
        }
      }
    });

    let store = stores.find(s => 
      normalizeString(s.name) === normalizeString(storeName)
    );

    if (!store) {
      store = await prisma.store.create({
        data: { name: storeName }
      });
    }

    // Verificar se o usuário já contribuiu hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingTodayContribution = await prisma.priceContribution.findFirst({
      where: {
        userId,
        productId: product.id,
        storeId: store.id,
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        status: { not: 'rejected' }
      }
    });

    if (existingTodayContribution) {
      return NextResponse.json(
        { error: 'Você já contribuiu com este produto hoje nesta loja' },
        { status: 400 }
      );
    }

    // Verificar se há outras contribuições similares de outros usuários
    const otherContributions = await prisma.priceContribution.findMany({
      where: {
        productId: product.id,
        storeId: store.id,
        userId: { not: userId },
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        status: { not: 'rejected' }
      }
    });

    const shouldBeApproved = otherContributions.length > 0;

    // Criar contribuição
    const contribution = await prisma.priceContribution.create({
      data: {
        userId,
        productId: product.id,
        storeId: store.id,
        price,
        status: shouldBeApproved ? 'approved' : 'pending'
      },
      include: {
        product: true,
        store: true
      }
    });

    // Se aprovado, marcar outras contribuições similares como aprovadas
    if (shouldBeApproved) {
      await prisma.priceContribution.updateMany({
        where: {
          productId: product.id,
          storeId: store.id,
          createdAt: {
            gte: today,
            lt: tomorrow
          },
          status: 'pending'
        },
        data: { status: 'approved' }
      });
    }

    return NextResponse.json({
      id: contribution.id,
      productName: contribution.product.name,
      price: Number(contribution.price),
      storeName: contribution.store.name,
      city,
      state,
      contributorName: 'Usuário', // Será atualizado com dados do Clerk
      userId: contribution.userId,
      timestamp: contribution.createdAt,
      verified: shouldBeApproved
    });
  } catch (error) {
    console.error('Error creating daily offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
