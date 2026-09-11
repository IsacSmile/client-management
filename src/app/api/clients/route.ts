import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        projects: {
          include: {
            payments: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Fetch clients error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, projectName, scope, totalAmount, upfrontPayment, status } = body;

    // Required fields: Client Name*, Project Name*, Total Amount*
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Client Name is required' }, { status: 400 });
    }
    if (!projectName || typeof projectName !== 'string' || !projectName.trim()) {
      return NextResponse.json({ error: 'Project Name is required' }, { status: 400 });
    }
    const numTotalAmount = parseFloat(totalAmount);
    if (isNaN(numTotalAmount) || numTotalAmount <= 0) {
      return NextResponse.json({ error: 'Valid Total Amount is required' }, { status: 400 });
    }

    const numUpfront = parseFloat(upfrontPayment) || 0;

    // Run creation in one transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const client = await tx.client.create({
        data: {
          name: name.trim(),
          email: email?.trim() || '',
          phone: phone?.trim() || '',
        },
      });

      const project = await tx.project.create({
        data: {
          clientId: client.id,
          name: projectName.trim(),
          scope: scope?.trim() || '',
          totalAmount: numTotalAmount,
          status: status || 'NotStarted',
          progress: status === 'Completed' ? 100 : 0,
        },
      });

      let payment = null;
      if (numUpfront > 0) {
        payment = await tx.payment.create({
          data: {
            clientId: client.id,
            projectId: project.id,
            amount: numUpfront,
            paymentDate: new Date(),
            note: 'Upfront Payment',
          },
        });
      }

      return { client, project, payment };
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
