import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        projects: {
          include: {
            payments: {
              orderBy: { paymentDate: 'desc' },
            },
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Fetch client detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch client details' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, projectName, scope, totalAmount, status } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Client Name is required' }, { status: 400 });
    }

    // Update Client info
    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        email: email?.trim() || '',
        phone: phone?.trim() || '',
      },
    });

    // If project updates are included
    if (projectName && totalAmount) {
      const firstProject = await prisma.project.findFirst({
        where: { clientId: params.id },
      });

      if (firstProject) {
        await prisma.project.update({
          where: { id: firstProject.id },
          data: {
            name: projectName.trim(),
            scope: scope?.trim() || '',
            totalAmount: parseFloat(totalAmount),
            status: status || firstProject.status,
          },
        });
      }
    }

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    
    // Deleting client automatically cascades to projects and payments due to onDelete: Cascade
    await prisma.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
