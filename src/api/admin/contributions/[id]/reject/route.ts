
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';

// POST - Rejeitar contribuição (admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se o usuário é admin
    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const contribution = await prisma.priceContribution.update({
      where: { id: params.id },
      data: { status: 'rejected' },
      include: {
        product: true,
        store: true
      }
    });

    return NextResponse.json(contribution);
  } catch (error) {
    console.error('Error rejecting contribution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
