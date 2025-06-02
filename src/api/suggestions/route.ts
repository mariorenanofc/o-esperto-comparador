
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar sugestões do usuário
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const suggestions = await prisma.suggestion.findMany({
      where: { userId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar nova sugestão
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category } = await request.json();

    const suggestion = await prisma.suggestion.create({
      data: {
        userId,
        title,
        description,
        category,
        status: 'open'
      },
      include: { user: true }
    });

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error('Error creating suggestion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
