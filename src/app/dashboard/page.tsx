import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  calculateTotalPaid, 
  calculateRemaining, 
  getPaymentStatus, 
  formatCurrency, 
  calculateDashboardStats,
  PaymentStatus 
} from '@/lib/finance';
import { Users, Briefcase, IndianRupee, Wallet, Plus, ArrowRight } from 'lucide-react';

export const revalidate = 0;

interface RecentClientItem {
  id: string;
  name: string;
  projectName: string;
  upfront: number;
  remaining: number;
  payStatus: PaymentStatus;
}

interface DueProjectItem {
  clientId: string;
  clientName: string;
  projectName: string;
  totalAmount: number;
  paid: number;
  remaining: number;
}

export default async function DashboardPage() {
  const session = await getSession();
  
  // Fetch data
  const clientsCount = await prisma.client.count();
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

  const allPayments = await prisma.payment.findMany();

  // Core calculations using lib/finance.ts
  const stats = calculateDashboardStats(
    clientsCount,
    projects.map((p) => ({
      totalAmount: p.totalAmount,
      status: p.status,
      payments: p.payments,
    })),
    allPayments
  );

  // Recent Clients list (up to 5)
  const recentClients: RecentClientItem[] = clients.slice(0, 5).map((c) => {
    const mainProject = c.projects[0];
    const totalAmount = mainProject ? mainProject.totalAmount : 0;
    const paid = mainProject ? calculateTotalPaid(mainProject.payments) : 0;
    const remaining = calculateRemaining(totalAmount, paid);
    const payStatus = mainProject ? getPaymentStatus(totalAmount, paid) : 'Unpaid';

    return {
      id: c.id,
      name: c.name,
      projectName: mainProject ? mainProject.name : 'N/A',
      upfront: mainProject && mainProject.payments.length > 0 ? mainProject.payments[0].amount : 0,
      remaining,
      payStatus,
    };
  });

  // Payment Due list (projects with remaining > 0)
  const dueProjects: DueProjectItem[] = projects
    .map((p) => {
      const paid = calculateTotalPaid(p.payments);
      const remaining = calculateRemaining(p.totalAmount, paid);
      return {
        clientId: p.clientId,
        clientName: p.client.name,
        projectName: p.name,
        totalAmount: p.totalAmount,
        paid,
        remaining,
      };
    })
    .filter((p) => p.remaining > 0);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg">
      <Sidebar userName={session?.name} userEmail={session?.email} />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Dashboard</h1>
            <p className="text-sm text-brand-secondary mt-1">Overview of clients, projects, and financials</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-nav hover:bg-brand-dark text-white text-sm font-medium rounded-md border border-brand-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </Link>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Clients */}
          <div className="bg-white border border-brand-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-brand-secondary">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Clients</span>
              <div className="p-2 bg-brand-surface rounded-md border border-brand-border">
                <Users className="w-4 h-4 text-brand-dark" />
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-dark">{stats.totalClients}</p>
          </div>

          {/* Card 2: Active Projects */}
          <div className="bg-white border border-brand-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-brand-secondary">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Projects</span>
              <div className="p-2 bg-brand-surface rounded-md border border-brand-border">
                <Briefcase className="w-4 h-4 text-brand-dark" />
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-dark">{stats.activeProjects}</p>
          </div>

          {/* Card 3: Payment Due */}
          <div className="bg-white border border-brand-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-brand-secondary">
              <span className="text-xs font-semibold uppercase tracking-wider">Payment Due</span>
              <div className="p-2 bg-brand-surface rounded-md border border-brand-border">
                <Wallet className="w-4 h-4 text-brand-dark" />
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-dark">{formatCurrency(stats.totalDue)}</p>
          </div>

          {/* Card 4: Payment Received */}
          <div className="bg-white border border-brand-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-brand-secondary">
              <span className="text-xs font-semibold uppercase tracking-wider">Payment Received</span>
              <div className="p-2 bg-brand-surface rounded-md border border-brand-border">
                <IndianRupee className="w-4 h-4 text-brand-dark" />
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-dark">{formatCurrency(stats.totalReceived)}</p>
          </div>
        </div>

        {/* Recent Clients Section */}
        <div className="bg-white border border-brand-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h2 className="text-xl font-semibold text-brand-dark">Recent Clients</h2>
            <Link
              href="/clients"
              className="text-xs font-semibold text-brand-dark hover:underline inline-flex items-center gap-1"
            >
              <span>View All Clients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <p className="text-sm text-brand-muted py-4">No recent clients found.</p>
          ) : (
            <>
              {/* Desktop & Tablet Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-border text-xs font-semibold text-brand-secondary uppercase tracking-wider bg-brand-surface">
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Upfront</th>
                      <th className="py-3 px-4">Remaining</th>
                      <th className="py-3 px-4">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {recentClients.map((c: RecentClientItem) => (
                      <tr key={c.id} className="hover:bg-brand-surface/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-brand-dark">
                          <Link href={`/clients/${c.id}`} className="hover:underline">
                            {c.name}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-brand-secondary">{c.projectName}</td>
                        <td className="py-3.5 px-4 text-brand-dark">{formatCurrency(c.upfront)}</td>
                        <td className="py-3.5 px-4 text-brand-dark">{formatCurrency(c.remaining)}</td>
                        <td className="py-3.5 px-4">
                          <StatusBadge type="payment" status={c.payStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Collapsed Cards */}
              <div className="sm:hidden space-y-3">
                {recentClients.map((c: RecentClientItem) => (
                  <div key={c.id} className="p-4 border border-brand-border rounded-md bg-brand-bg space-y-2">
                    <div className="flex items-center justify-between">
                      <Link href={`/clients/${c.id}`} className="font-semibold text-brand-dark hover:underline">
                        {c.name}
                      </Link>
                      <StatusBadge type="payment" status={c.payStatus} />
                    </div>
                    <p className="text-xs text-brand-secondary">Project: {c.projectName}</p>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-brand-border text-brand-dark">
                      <span>Upfront: {formatCurrency(c.upfront)}</span>
                      <span>Remaining: {formatCurrency(c.remaining)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Payment Due Section */}
        <div className="bg-white border border-brand-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h2 className="text-xl font-semibold text-brand-dark">Payment Due</h2>
            <Link
              href="/payments"
              className="text-xs font-semibold text-brand-dark hover:underline inline-flex items-center gap-1"
            >
              <span>View Payments Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {dueProjects.length === 0 ? (
            <p className="text-sm text-brand-muted py-4">All projects are fully paid.</p>
          ) : (
            <>
              {/* Desktop & Tablet Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-border text-xs font-semibold text-brand-secondary uppercase tracking-wider bg-brand-surface">
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Total Value</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Remaining Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {dueProjects.map((p: DueProjectItem, idx: number) => (
                      <tr key={idx} className="hover:bg-brand-surface/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-brand-dark">
                          <Link href={`/clients/${p.clientId}`} className="hover:underline">
                            {p.clientName}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-brand-secondary">{p.projectName}</td>
                        <td className="py-3.5 px-4 text-brand-dark">{formatCurrency(p.totalAmount)}</td>
                        <td className="py-3.5 px-4 text-brand-dark">{formatCurrency(p.paid)}</td>
                        <td className="py-3.5 px-4 font-semibold text-brand-dark">{formatCurrency(p.remaining)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Collapsed Cards */}
              <div className="sm:hidden space-y-3">
                {dueProjects.map((p: DueProjectItem, idx: number) => (
                  <div key={idx} className="p-4 border border-brand-border rounded-md bg-brand-bg space-y-2">
                    <div className="flex items-center justify-between">
                      <Link href={`/clients/${p.clientId}`} className="font-semibold text-brand-dark hover:underline">
                        {p.clientName}
                      </Link>
                      <span className="text-xs font-bold text-brand-dark">Due: {formatCurrency(p.remaining)}</span>
                    </div>
                    <p className="text-xs text-brand-secondary">Project: {p.projectName}</p>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-brand-border text-brand-secondary">
                      <span>Total: {formatCurrency(p.totalAmount)}</span>
                      <span>Paid: {formatCurrency(p.paid)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
