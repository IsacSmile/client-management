'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { DeleteClientButton } from '@/components/DeleteClientButton';
import { 
  calculateTotalPaid, 
  calculateRemaining, 
  getPaymentStatus, 
  formatCurrency, 
  getInitials,
  PaymentStatus 
} from '@/lib/finance';
import { DatePreset, getPaymentDateRange, getPresetLabel } from '@/lib/date-filters';
import { CustomDateRangePicker } from '@/components/CustomDateRangePicker';
import { 
  Users, 
  Briefcase, 
  IndianRupee, 
  Wallet, 
  Plus, 
  ArrowRight, 
  Calendar, 
  AlertCircle,
  Filter
} from 'lucide-react';

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

interface DashboardViewProps {
  initialClients: any[];
  initialProjects: any[];
  initialPayments: any[];
  userName?: string;
  userEmail?: string;
}

export function DashboardView({
  initialClients,
  initialProjects,
  initialPayments,
  userName,
  userEmail,
}: DashboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query state
  const rangeParam = (searchParams.get('range') || 'all_time') as DatePreset;
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';

  // Local state
  const [preset, setPreset] = useState<DatePreset>(rangeParam);
  const [customFrom, setCustomFrom] = useState<string>(fromParam);
  const [customTo, setCustomTo] = useState<string>(toParam);

  // Sync state when URL params change
  useEffect(() => {
    setPreset(rangeParam);
    setCustomFrom(fromParam);
    setCustomTo(toParam);
  }, [searchParams]);

  // Handle Preset Button Click
  const handlePresetChange = (newPreset: DatePreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      const params = new URLSearchParams();
      if (newPreset !== 'all_time') {
        params.set('range', newPreset);
      }
      const queryString = params.toString();
      router.push(queryString ? `/dashboard?${queryString}` : '/dashboard');
    }
  };

  // Custom range validation logic
  const isInvalidCustomRange = preset === 'custom' && Boolean(customFrom && customTo && customFrom > customTo);
  const isApplyDisabled = preset === 'custom' && (!customFrom || !customTo || isInvalidCustomRange);

  const handleApplyCustomRange = () => {
    if (isApplyDisabled) return;
    const params = new URLSearchParams();
    params.set('range', 'custom');
    params.set('from', customFrom);
    params.set('to', customTo);
    router.push(`/dashboard?${params.toString()}`);
  };

  // Get active date range filter object
  const dateRange = getPaymentDateRange(preset, customFrom, customTo);

  // --- Dynamic Filtering Across All Data Sets ---

  // 1. Filtered Payments
  const filteredPayments = dateRange
    ? initialPayments.filter((p) => {
        const d = new Date(p.paymentDate);
        return d >= dateRange.from && d <= dateRange.to;
      })
    : initialPayments;

  // 2. Filtered Projects
  const filteredProjects = dateRange
    ? initialProjects.filter((p) => {
        const pCreated = new Date(p.createdAt);
        const hasPaymentInRange = p.payments?.some((pay: any) => {
          const pd = new Date(pay.paymentDate);
          return pd >= dateRange.from && pd <= dateRange.to;
        });
        return (pCreated >= dateRange.from && pCreated <= dateRange.to) || hasPaymentInRange;
      })
    : initialProjects;

  // 3. Filtered Clients
  const filteredClients = dateRange
    ? initialClients.filter((c) => {
        const cCreated = new Date(c.createdAt);
        const hasProjectInRange = c.projects?.some((p: any) => {
          const pCreated = new Date(p.createdAt);
          const hasPay = p.payments?.some((pay: any) => {
            const pd = new Date(pay.paymentDate);
            return pd >= dateRange.from && pd <= dateRange.to;
          });
          return (pCreated >= dateRange.from && pCreated <= dateRange.to) || hasPay;
        });
        return (cCreated >= dateRange.from && cCreated <= dateRange.to) || hasProjectInRange;
      })
    : initialClients;

  // --- Dynamic Metric Calculations ---
  const totalClientsCount = filteredClients.length;
  const activeProjectsCount = filteredProjects.filter((p) => p.status !== 'Completed').length;
  
  // Total Received in selected date range
  const totalReceived = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  // Total Outstanding Due for projects in selected range
  const totalDue = filteredProjects.reduce((sum, p) => {
    const paidAllTime = p.payments?.reduce((s: number, pay: any) => s + pay.amount, 0) || 0;
    return sum + calculateRemaining(p.totalAmount, paidAllTime);
  }, 0);

  // Filtered Recent Clients list
  const recentClients: RecentClientItem[] = filteredClients.slice(0, 5).map((c) => {
    const mainProject = c.projects?.[0];
    const totalAmount = mainProject ? mainProject.totalAmount : 0;
    const paid = mainProject ? calculateTotalPaid(mainProject.payments) : 0;
    const remaining = calculateRemaining(totalAmount, paid);
    const payStatus = mainProject ? getPaymentStatus(totalAmount, paid) : 'Unpaid';

    return {
      id: c.id,
      name: c.name,
      projectName: mainProject ? mainProject.name : 'N/A',
      upfront: mainProject && mainProject.payments?.length > 0 ? mainProject.payments[0].amount : 0,
      remaining,
      payStatus,
    };
  });

  // Filtered Payment Due list
  const dueProjects: DueProjectItem[] = filteredProjects
    .map((p) => {
      const paid = calculateTotalPaid(p.payments);
      const remaining = calculateRemaining(p.totalAmount, paid);
      return {
        clientId: p.clientId,
        clientName: p.client?.name || 'Client',
        projectName: p.name,
        totalAmount: p.totalAmount,
        paid,
        remaining,
      };
    })
    .filter((p) => p.remaining > 0);

  const scopeSuffix = preset !== 'all_time' ? ` (${getPresetLabel(preset)})` : '';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg">
      <Sidebar userName={userName} userEmail={userEmail} />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
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

        {/* Dynamic Date Filter Control Block */}
        <div className="bg-white border border-zinc-200/80 p-3.5 sm:p-4.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-zinc-100/90 rounded-xl border border-zinc-200/60 text-zinc-700 shrink-0">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold text-zinc-900">Dashboard Filter</h2>
                <p className="hidden sm:block text-xs text-zinc-500">Filter all summary metrics, clients, and payment ledgers by period</p>
              </div>
            </div>

            {/* Custom Interactive Calendar & Preset Picker */}
            <CustomDateRangePicker
              preset={preset}
              customFrom={customFrom}
              customTo={customTo}
              onPresetChange={(newPreset) => handlePresetChange(newPreset)}
              onCustomRangeApply={(from, to) => {
                setCustomFrom(from);
                setCustomTo(to);
                const params = new URLSearchParams();
                params.set('range', 'custom');
                params.set('from', from);
                params.set('to', to);
                router.push(`/dashboard?${params.toString()}`);
              }}
            />
          </div>
        </div>

        {/* 4 Dynamic Summary Cards (Compact 2x2 Grid on Mobile with Small Typography) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Clients */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3 sm:p-4 space-y-1.5 shadow-2xs hover:shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate" title={`Total Clients${scopeSuffix}`}>
                Clients{scopeSuffix}
              </span>
              <div className="p-1.5 bg-indigo-50/80 text-indigo-600 rounded-lg border border-indigo-100 shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-zinc-900 tracking-tight">{totalClientsCount}</p>
          </div>

          {/* Card 2: Active Projects */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3 sm:p-4 space-y-1.5 shadow-2xs hover:shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate" title={`Active Projects${scopeSuffix}`}>
                Projects{scopeSuffix}
              </span>
              <div className="p-1.5 bg-amber-50/80 text-amber-600 rounded-lg border border-amber-100 shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-zinc-900 tracking-tight">{activeProjectsCount}</p>
          </div>

          {/* Card 3: Payment Due */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3 sm:p-4 space-y-1.5 shadow-2xs hover:shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate" title={`Payment Due${scopeSuffix}`}>
                Payment Due{scopeSuffix}
              </span>
              <div className="p-1.5 bg-rose-50/80 text-rose-600 rounded-lg border border-rose-100 shrink-0">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-zinc-900 tracking-tight">{formatCurrency(totalDue)}</p>
          </div>

          {/* Card 4: Payment Received */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3 sm:p-4 space-y-1.5 shadow-2xs hover:shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate" title={`Payment Received${scopeSuffix}`}>
                Received{scopeSuffix}
              </span>
              <div className="p-1.5 bg-emerald-50/80 text-emerald-600 rounded-lg border border-emerald-100 shrink-0">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-zinc-900 tracking-tight">{formatCurrency(totalReceived)}</p>
          </div>
        </div>

        {/* Recent Clients Section */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Recent Clients</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Latest client onboarding & billing status{scopeSuffix}</p>
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
            <p className="text-sm text-zinc-400 py-6 text-center">
              {preset !== 'all_time' ? 'No recent clients found for this date range.' : 'No recent clients found.'}
            </p>
          ) : (
            <>
              {/* Desktop & Tablet Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200/80 text-[11px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/60">
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
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                              {getInitials(c.name)}
                            </div>
                            <Link href={`/clients/${c.id}`} className="font-semibold text-zinc-900 hover:underline">
                              {c.name}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 font-medium">{c.projectName}</td>
                        <td className="py-3.5 px-4 text-zinc-900">{formatCurrency(c.upfront)}</td>
                        <td className="py-3.5 px-4 text-zinc-900 font-semibold">{formatCurrency(c.remaining)}</td>
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

              {/* Breathable Mobile Cards with Small Typography (<640px) */}
              <div className="sm:hidden space-y-3 pt-2">
                {recentClients.map((c: RecentClientItem) => (
                  <div key={c.id} className="p-3.5 border border-zinc-200/80 rounded-xl bg-white space-y-2.5 shadow-2xs hover:border-zinc-300 transition-all">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-semibold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                          {getInitials(c.name)}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/clients/${c.id}`} className="font-semibold text-zinc-900 hover:underline text-xs sm:text-sm truncate block">
                            {c.name}
                          </Link>
                          <p className="text-[11px] text-zinc-400 font-normal truncate mt-0.5">{c.projectName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusBadge type="payment" status={c.payStatus} />
                        <DeleteClientButton clientId={c.id} clientName={c.name} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-zinc-50/80 p-2 rounded-lg border border-zinc-100/90">
                      <span className="text-zinc-500">Upfront: <strong className="text-zinc-900 font-semibold">{formatCurrency(c.upfront)}</strong></span>
                      <span className="text-zinc-500">Remaining: <strong className={`font-semibold ${c.remaining > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>{formatCurrency(c.remaining)}</strong></span>
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
              <p className="text-xs text-zinc-500 mt-0.5">Projects with outstanding balances{scopeSuffix}</p>
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
            <p className="text-sm text-zinc-400 py-6 text-center">
              {preset !== 'all_time' ? 'No projects with payment due in this date range.' : 'All projects are fully paid.'}
            </p>
          ) : (
            <>
              {/* Desktop & Tablet Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200/80 text-[11px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/60">
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
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                              {getInitials(p.clientName)}
                            </div>
                            <Link href={`/clients/${p.clientId}`} className="hover:underline">
                              {p.clientName}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 font-medium">{p.projectName}</td>
                        <td className="py-3.5 px-4 text-zinc-900">{formatCurrency(p.totalAmount)}</td>
                        <td className="py-3.5 px-4 text-zinc-900">{formatCurrency(p.paid)}</td>
                        <td className="py-3.5 px-4 font-bold text-rose-600">{formatCurrency(p.remaining)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <DeleteClientButton clientId={p.clientId} clientName={p.clientName} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Breathable Mobile Cards with Small Typography (<640px) */}
              <div className="sm:hidden space-y-3 pt-2">
                {dueProjects.map((p: DueProjectItem, idx: number) => (
                  <div key={idx} className="p-3.5 border border-zinc-200/80 rounded-xl bg-white space-y-2.5 shadow-2xs hover:border-zinc-300 transition-all">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-semibold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                          {getInitials(p.clientName)}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/clients/${p.clientId}`} className="font-semibold text-zinc-900 hover:underline text-xs sm:text-sm truncate block">
                            {p.clientName}
                          </Link>
                          <p className="text-[11px] text-zinc-400 font-normal truncate mt-0.5">{p.projectName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <DeleteClientButton clientId={p.clientId} clientName={p.clientName} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-zinc-50/80 p-2 rounded-lg border border-zinc-100/90">
                      <span className="text-zinc-500">Paid: <strong className="text-emerald-700 font-semibold">{formatCurrency(p.paid)}</strong></span>
                      <span className="text-zinc-500">Due: <strong className="text-rose-600 font-semibold">{formatCurrency(p.remaining)}</strong></span>
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
