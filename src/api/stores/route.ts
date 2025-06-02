
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar todas as lojas
export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        productPrices: {
          include: { product: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar nova loja
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    const store = await prisma.store.create({
      data: { name }
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
