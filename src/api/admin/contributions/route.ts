
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar todas as contribuições (admin)
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se o usuário é admin (implementar lógica de roles)
    // const user = await clerkClient.users.getUser(userId);
    // if (!user.publicMetadata.isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const contributions = await prisma.priceContribution.findMany({
      include: {
        product: true,
        store: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(contributions);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
