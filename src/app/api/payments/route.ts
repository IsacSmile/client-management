import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { clientId, projectId, amount, paymentDate, note } = await request.json();

    if (!clientId || !projectId) {
      return NextResponse.json({ error: 'Client ID and Project ID are required' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        clientId,
        projectId,
        amount: numAmount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        note: note?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
