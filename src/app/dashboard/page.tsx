import React, { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DashboardView } from '@/components/DashboardView';

import DashboardLoading from './loading';

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();

  // Fetch initial raw dataset from Prisma
  const clients = await prisma.client.findMany({
    include: {
      projects: {
        include: { payments: true },
      },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const projects = await prisma.project.findMany({
    include: {
      client: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const allPayments = await prisma.payment.findMany({
    orderBy: { paymentDate: 'desc' },
  });

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardView
        initialClients={JSON.parse(JSON.stringify(clients))}
        initialProjects={JSON.parse(JSON.stringify(projects))}
        initialPayments={JSON.parse(JSON.stringify(allPayments))}
        userName={session?.name}
        userEmail={session?.email}
      />
    </Suspense>
  );
}
