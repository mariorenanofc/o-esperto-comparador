
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar contribuições de preço do usuário
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contributions = await prisma.priceContribution.findMany({
      where: { userId },
      include: {
        product: true,
        store: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(contributions);
  } catch (error) {
    console.error('Error fetching price contributions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar nova contribuição de preço
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productName, storeName, price, quantity, unit, city, state } = await request.json();

    // Buscar ou criar produto
    let product = await prisma.product.findFirst({
      where: {
        name: {
          equals: productName,
          mode: 'insensitive'
        },
        quantity,
        unit
      }
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: productName,
          quantity,
          unit
        }
      });
    }

    // Buscar ou criar loja
    let store = await prisma.store.findFirst({
      where: {
        name: {
          equals: storeName,
          mode: 'insensitive'
        }
      }
    });

    if (!store) {
      store = await prisma.store.create({
        data: { name: storeName }
      });
    }

    // Verificar se o usuário já contribuiu com este produto nesta loja
    const existingContribution = await prisma.priceContribution.findFirst({
      where: {
        userId,
        productId: product.id,
        storeId: store.id,
        status: { not: 'rejected' }
      }
    });

    if (existingContribution) {
      return NextResponse.json(
        { error: 'Você já contribuiu com este produto nesta loja' },
        { status: 400 }
      );
    }

    // Criar contribuição
    const contribution = await prisma.priceContribution.create({
      data: {
        userId,
        productId: product.id,
        storeId: store.id,
        price,
        status: 'pending'
      },
      include: {
        product: true,
        store: true,
        user: true
      }
    });

    // Verificar se deve ser aprovado automaticamente
    const otherContributions = await prisma.priceContribution.findMany({
      where: {
        productId: product.id,
        storeId: store.id,
        userId: { not: userId },
        status: 'approved'
      }
    });

    if (otherContributions.length > 0) {
      // Se há outras contribuições aprovadas, aprovar automaticamente
      await prisma.priceContribution.update({
        where: { id: contribution.id },
        data: { status: 'approved' }
      });

      // Atualizar preço do produto
      await prisma.productPrice.upsert({
        where: {
          productId_storeId: {
            productId: product.id,
            storeId: store.id
          }
        },
        update: { price },
        create: {
          productId: product.id,
          storeId: store.id,
          price
        }
      });
    }

    return NextResponse.json(contribution);
  } catch (error) {
    console.error('Error creating price contribution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
