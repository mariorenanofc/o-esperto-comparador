
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar comparações do usuário
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comparisons = await prisma.comparison.findMany({
      where: { userId },
      include: {
        comparisonStores: {
          include: { store: true }
        },
        comparisonProducts: {
          include: { 
            product: {
              include: {
                productPrices: {
                  include: { store: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(comparisons);
  } catch (error) {
    console.error('Error fetching comparisons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar nova comparação
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { products, stores, date } = await request.json();

    const comparison = await prisma.comparison.create({
      data: {
        userId,
        date: date ? new Date(date) : new Date(),
      }
    });

    // Adicionar lojas à comparação
    for (const store of stores) {
      await prisma.comparisonStore.create({
        data: {
          comparisonId: comparison.id,
          storeId: store.id
        }
      });
    }

    // Adicionar produtos à comparação
    for (const product of products) {
      await prisma.comparisonProduct.create({
        data: {
          comparisonId: comparison.id,
          productId: product.id
        }
      });
    }

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Error creating comparison:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
