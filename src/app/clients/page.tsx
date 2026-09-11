'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { DeleteClientButton } from '@/components/DeleteClientButton';
import { calculateTotalPaid, calculateRemaining, getPaymentStatus, formatCurrency, getInitials } from '@/lib/finance';
import { Plus, Search, UserPlus, FileText, Briefcase } from 'lucide-react';

interface ClientWithProject {
  id: string;
  name: string;
  email: string;
  phone: string;
  projects: {
    id: string;
    name: string;
    scope: string;
    totalAmount: number;
    status: string;
    payments: { amount: number }[];
  }[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter clients by search query (searches name, project, email, phone)
  const filteredClients = clients.filter((c) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    const matchName = c.name.toLowerCase().includes(query);
    const matchEmail = c.email.toLowerCase().includes(query);
    const matchPhone = c.phone.toLowerCase().includes(query);
    const matchProject = c.projects.some((p) => p.name.toLowerCase().includes(query));

    return matchName || matchEmail || matchPhone || matchProject;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50/50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Clients</h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">Manage client profiles, projects, and financial standing</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, project, email, or phone..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Clients Table / Cards / Empty State */}
        {loading ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center text-zinc-400 text-xs sm:text-sm shadow-sm">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          /* Empty State when zero clients exist */
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="inline-flex p-3.5 rounded-2xl bg-zinc-100 border border-zinc-200/60 mb-1">
              <UserPlus className="w-6 h-6 text-zinc-700" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">No clients yet</h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
              Add your first client to start managing your projects and payments.
            </p>
            <div className="pt-2">
              <Link
                href="/clients/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Client</span>
              </Link>
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center text-zinc-400 text-xs sm:text-sm shadow-sm">
            No clients match your search &quot;{search}&quot;.
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table Container */}
            <div className="hidden sm:block bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/60">
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Scope</th>
                      <th className="py-3 px-4">Total Paid</th>
                      <th className="py-3 px-4">Remaining</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredClients.map((c) => {
                      const mainProject = c.projects[0];
                      const totalAmount = mainProject ? mainProject.totalAmount : 0;
                      const paid = mainProject ? calculateTotalPaid(mainProject.payments) : 0;
                      const remaining = calculateRemaining(totalAmount, paid);
                      const payStatus = mainProject ? getPaymentStatus(totalAmount, paid) : 'Unpaid';

                      return (
                        <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                                {getInitials(c.name)}
                              </div>
                              <div>
                                <Link href={`/clients/${c.id}`} className="font-semibold text-zinc-900 hover:text-zinc-600 transition-colors block">
                                  {c.name}
                                </Link>
                                <span className="text-xs text-zinc-400 block font-normal">{c.email || c.phone || 'No contact'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-900 font-medium">
                            {mainProject ? mainProject.name : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 max-w-xs truncate font-normal">
                            {mainProject ? mainProject.scope || '—' : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-700 font-medium">{formatCurrency(paid)}</td>
                          <td className={`py-3.5 px-4 font-semibold ${remaining > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>{formatCurrency(remaining)}</td>
                          <td className="py-3.5 px-4">
                            <StatusBadge type="payment" status={payStatus} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <DeleteClientButton clientId={c.id} clientName={c.name} onSuccess={fetchClients} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Redesigned Premium Mobile Floating Cards (<640px) */}
            <div className="sm:hidden space-y-3.5">
              {filteredClients.map((c) => {
                const mainProject = c.projects[0];
                const totalAmount = mainProject ? mainProject.totalAmount : 0;
                const paid = mainProject ? calculateTotalPaid(mainProject.payments) : 0;
                const remaining = calculateRemaining(totalAmount, paid);
                const payStatus = mainProject ? getPaymentStatus(totalAmount, paid) : 'Unpaid';

                return (
                  <div 
                    key={c.id} 
                    className="p-4.5 border border-zinc-200/90 rounded-2xl bg-white shadow-xs hover:shadow-md transition-all duration-200 space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs border border-zinc-800">
                          {getInitials(c.name)}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/clients/${c.id}`} className="font-extrabold text-zinc-900 hover:text-zinc-600 transition-colors text-base tracking-tight truncate block">
                            {c.name}
                          </Link>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">{c.email || c.phone || 'No contact'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge type="payment" status={payStatus} />
                        <DeleteClientButton clientId={c.id} clientName={c.name} onSuccess={fetchClients} />
                      </div>
                    </div>

                    {mainProject && (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-zinc-100/90 text-zinc-700 text-[11px] font-semibold border border-zinc-200/60">
                          <Briefcase className="w-3 h-3 text-zinc-400" />
                          <span className="truncate max-w-[150px]">{mainProject.name}</span>
                        </span>
                      </div>
                    )}

                    {/* 3-Column Financial Grid Pill Cards */}
                    <div className="grid grid-cols-3 gap-2 pt-0.5">
                      <div className="p-2.5 bg-zinc-50/80 border border-zinc-200/60 rounded-xl text-center">
                        <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-0.5">TOTAL</span>
                        <span className="text-xs font-extrabold text-zinc-900 block truncate">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-center">
                        <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-0.5">PAID</span>
                        <span className="text-xs font-extrabold text-emerald-950 block truncate">{formatCurrency(paid)}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl text-center border ${
                        remaining > 0 ? 'bg-rose-50/70 border-rose-200/60' : 'bg-zinc-50 border-zinc-200/60'
                      }`}>
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider block mb-0.5 ${
                          remaining > 0 ? 'text-rose-700' : 'text-zinc-400'
                        }`}>DUE</span>
                        <span className={`text-xs font-extrabold block truncate ${
                          remaining > 0 ? 'text-rose-950' : 'text-zinc-900'
                        }`}>{formatCurrency(remaining)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
