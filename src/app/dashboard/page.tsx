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
import { DeleteClientButton } from '@/components/DeleteClientButton';
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1">Overview of clients, projects, and financials</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </Link>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Clients */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition-all">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Clients</span>
              <div className="p-2.5 bg-zinc-100/80 rounded-xl text-zinc-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">{stats.totalClients}</p>
          </div>

          {/* Card 2: Active Projects */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition-all">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Projects</span>
              <div className="p-2.5 bg-zinc-100/80 rounded-xl text-zinc-700">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">{stats.activeProjects}</p>
          </div>

          {/* Card 3: Payment Due */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition-all">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Payment Due</span>
              <div className="p-2.5 bg-zinc-100/80 rounded-xl text-zinc-700">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">{formatCurrency(stats.totalDue)}</p>
          </div>

          {/* Card 4: Payment Received */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition-all">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Payment Received</span>
              <div className="p-2.5 bg-zinc-100/80 rounded-xl text-zinc-700">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">{formatCurrency(stats.totalReceived)}</p>
          </div>
        </div>

        {/* Recent Clients Section */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Recent Clients</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Latest client onboarding & billing status</p>
            </div>
            <Link
              href="/clients"
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:underline inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View All Clients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <p className="text-sm text-zinc-400 py-6 text-center">No recent clients found.</p>
          ) : (
            <>
              {/* Desktop & Tablet Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/60">
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Upfront</th>
                      <th className="py-3 px-4">Remaining</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {recentClients.map((c: RecentClientItem) => (
                      <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-zinc-900">
                          <Link href={`/clients/${c.id}`} className="hover:underline">
                            {c.name}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600">{c.projectName}</td>
                        <td className="py-3.5 px-4 text-zinc-900">{formatCurrency(c.upfront)}</td>
                        <td className="py-3.5 px-4 text-zinc-900 font-medium">{formatCurrency(c.remaining)}</td>
                        <td className="py-3.5 px-4">
                          <StatusBadge type="payment" status={c.payStatus} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <DeleteClientButton clientId={c.id} clientName={c.name} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Collapsed Cards */}
              <div className="sm:hidden space-y-3">
                {recentClients.map((c: RecentClientItem) => (
                  <div key={c.id} className="p-4 border border-zinc-200/80 rounded-xl bg-zinc-50/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Link href={`/clients/${c.id}`} className="font-semibold text-zinc-900 hover:underline">
                        {c.name}
                      </Link>
                      <div className="flex items-center gap-2">
                        <StatusBadge type="payment" status={c.payStatus} />
                        <DeleteClientButton clientId={c.id} clientName={c.name} />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">Project: {c.projectName}</p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200/60 text-zinc-900 font-medium">
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
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Payment Due</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Projects with outstanding balances</p>
            </div>
            <Link
              href="/payments"
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:underline inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View Payments Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {dueProjects.length === 0 ? (
            <p className="text-sm text-zinc-400 py-6 text-center">All projects are fully paid.</p>
          ) : (
            <>
              {/* Desktop & Tablet Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/60">
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Total Value</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Remaining Due</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {dueProjects.map((p: DueProjectItem, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-zinc-900">
                          <Link href={`/clients/${p.clientId}`} className="hover:underline">
                            {p.clientName}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600">{p.projectName}</td>
                        <td className="py-3.5 px-4 text-zinc-900">{formatCurrency(p.totalAmount)}</td>
                        <td className="py-3.5 px-4 text-zinc-900">{formatCurrency(p.paid)}</td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900">{formatCurrency(p.remaining)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <DeleteClientButton clientId={p.clientId} clientName={p.clientName} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Collapsed Cards */}
              <div className="sm:hidden space-y-3">
                {dueProjects.map((p: DueProjectItem, idx: number) => (
                  <div key={idx} className="p-4 border border-zinc-200/80 rounded-xl bg-zinc-50/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Link href={`/clients/${p.clientId}`} className="font-semibold text-zinc-900 hover:underline">
                        {p.clientName}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">Due: {formatCurrency(p.remaining)}</span>
                        <DeleteClientButton clientId={p.clientId} clientName={p.clientName} />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">Project: {p.projectName}</p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200/60 text-zinc-600">
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
