
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Criar/atualizar preço do produto
export async function POST(request: NextRequest) {
  try {
    const { productId, storeId, price } = await request.json();

    const productPrice = await prisma.productPrice.upsert({
      where: {
        productId_storeId: {
          productId,
          storeId
        }
      },
      update: { price },
      create: {
        productId,
        storeId,
        price
      }
    });

    return NextResponse.json(productPrice);
  } catch (error) {
    console.error('Error upserting product price:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
