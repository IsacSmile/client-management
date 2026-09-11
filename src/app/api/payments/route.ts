import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentDateRange, DatePreset } from '@/lib/date-filters';
import { getPaymentStatus, calculateRemaining } from '@/lib/finance';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || searchParams.get('preset') || 'all_time') as DatePreset;
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');

    const dateRange = getPaymentDateRange(range, fromStr, toStr);

    // Prisma query filter for Payment.paymentDate
    const paymentWhere: Prisma.PaymentWhereInput = dateRange
      ? {
          paymentDate: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        }
      : {};

    // Fetch all clients & projects with payments filtered at Prisma query level
    const clients = await prisma.client.findMany({
      include: {
        projects: {
          include: {
            payments: {
              where: paymentWhere,
              orderBy: { paymentDate: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also fetch lifetime payments per project to calculate lifetime due and status
    const allProjects = await prisma.project.findMany({
      include: {
        payments: true,
      },
    });

    // Map project lifetime paid
    const lifetimePaidMap = new Map<string, number>();
    let totalDueAllTime = 0;

    allProjects.forEach((p) => {
      const allTimePaid = p.payments.reduce((sum, pay) => sum + pay.amount, 0);
      lifetimePaidMap.set(p.id, allTimePaid);
      totalDueAllTime += calculateRemaining(p.totalAmount, allTimePaid);
    });

    // Build ledger rows
    const paymentRows: any[] = [];
    let totalReceived = 0;

    clients.forEach((c) => {
      c.projects.forEach((p) => {
        const filteredPayments = p.payments;
        const paidInRange = filteredPayments.reduce((sum, pay) => sum + pay.amount, 0);
        const lifetimePaid = lifetimePaidMap.get(p.id) || 0;
        const due = calculateRemaining(p.totalAmount, lifetimePaid);
        const status = getPaymentStatus(p.totalAmount, lifetimePaid);

        // If date filter is active (not all_time), only include projects that have payments in range
        const hasRangeFilter = dateRange !== null;
        if (!hasRangeFilter || filteredPayments.length > 0) {
          totalReceived += paidInRange;
          paymentRows.push({
            clientId: c.id,
            clientName: c.name,
            projectId: p.id,
            projectName: p.name,
            totalAmount: p.totalAmount,
            paid: dateRange ? paidInRange : lifetimePaid,
            due,
            status,
            paymentCount: filteredPayments.length,
          });
        }
      });
    });

    return NextResponse.json({
      rows: paymentRows,
      totalReceived,
      totalDueAllTime,
      range,
      dateRange: dateRange
        ? { from: dateRange.from.toISOString(), to: dateRange.to.toISOString() }
        : null,
    });
  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

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
