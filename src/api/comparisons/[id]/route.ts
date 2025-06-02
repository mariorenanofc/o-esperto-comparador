
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// PUT - Atualizar comparação
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { products, stores } = await request.json();
    const comparisonId = params.id;

    // Verificar se a comparação pertence ao usuário
    const comparison = await prisma.comparison.findFirst({
      where: { id: comparisonId, userId }
    });

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    // Remover associações existentes
    await prisma.comparisonStore.deleteMany({
      where: { comparisonId }
    });
    await prisma.comparisonProduct.deleteMany({
      where: { comparisonId }
    });

    // Adicionar novas associações
    for (const store of stores) {
      await prisma.comparisonStore.create({
        data: {
          comparisonId,
          storeId: store.id
        }
      });
    }

    for (const product of products) {
      await prisma.comparisonProduct.create({
        data: {
          comparisonId,
          productId: product.id
        }
      });
    }

    const updatedComparison = await prisma.comparison.update({
      where: { id: comparisonId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(updatedComparison);
  } catch (error) {
    console.error('Error updating comparison:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Deletar comparação
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comparisonId = params.id;

    // Verificar se a comparação pertence ao usuário
    const comparison = await prisma.comparison.findFirst({
      where: { id: comparisonId, userId }
    });

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    await prisma.comparison.delete({
      where: { id: comparisonId }
    });

    return NextResponse.json({ message: 'Comparison deleted successfully' });
  } catch (error) {
    console.error('Error deleting comparison:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
