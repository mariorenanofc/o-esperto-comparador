
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar relatórios mensais do usuário
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.monthlyReport.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching monthly reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar novo relatório mensal
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { month, year, totalSpent } = await request.json();

    const report = await prisma.monthlyReport.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year
        }
      },
      update: { totalSpent },
      create: {
        userId,
        month,
        year,
        totalSpent
      }
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error creating monthly report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
