'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { DeleteClientButton } from '@/components/DeleteClientButton';
import { calculateTotalPaid, calculateRemaining, getPaymentStatus, formatCurrency } from '@/lib/finance';
import { Plus, Search, UserPlus, FileText } from 'lucide-react';

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
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Clients</h1>
            <p className="text-sm text-brand-secondary mt-1">Manage client profiles, projects, and financial standing</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-nav hover:bg-brand-dark text-white text-sm font-medium rounded-md border border-brand-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, project, email, or phone..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
            />
          </div>
        </div>

        {/* Clients Table / Cards / Empty State */}
        {loading ? (
          <div className="bg-white border border-brand-border rounded-lg p-12 text-center text-brand-muted text-sm">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          /* Empty State when zero clients exist */
          <div className="bg-white border border-brand-border rounded-lg p-12 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-brand-surface border border-brand-border mb-2">
              <UserPlus className="w-8 h-8 text-brand-dark" />
            </div>
            <h2 className="text-xl font-bold text-brand-dark">No clients yet</h2>
            <p className="text-sm text-brand-secondary max-w-md mx-auto">
              Add your first client to start managing your projects and payments.
            </p>
            <div className="pt-2">
              <Link
                href="/clients/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-nav hover:bg-brand-dark text-white text-sm font-medium rounded-md border border-brand-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Client</span>
              </Link>
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-lg p-12 text-center text-brand-muted text-sm">
            No clients match your search &quot;{search}&quot;.
          </div>
        ) : (
          <div className="bg-white border border-brand-border rounded-lg overflow-hidden">
            {/* Desktop & Tablet Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-xs font-semibold text-brand-secondary uppercase tracking-wider bg-brand-surface">
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Scope</th>
                    <th className="py-3.5 px-4">Total Paid</th>
                    <th className="py-3.5 px-4">Remaining</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredClients.map((c) => {
                    const mainProject = c.projects[0];
                    const totalAmount = mainProject ? mainProject.totalAmount : 0;
                    const paid = mainProject ? calculateTotalPaid(mainProject.payments) : 0;
                    const remaining = calculateRemaining(totalAmount, paid);
                    const payStatus = mainProject ? getPaymentStatus(totalAmount, paid) : 'Unpaid';

                    return (
                      <tr key={c.id} className="hover:bg-brand-surface/50 transition-colors">
                        <td className="py-4 px-4">
                          <Link href={`/clients/${c.id}`} className="font-semibold text-brand-dark hover:underline block">
                            {c.name}
                          </Link>
                          <span className="text-xs text-brand-muted block">{c.email || c.phone || 'No contact'}</span>
                        </td>
                        <td className="py-4 px-4 text-brand-dark font-medium">
                          {mainProject ? mainProject.name : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-brand-secondary max-w-xs truncate">
                          {mainProject ? mainProject.scope || '—' : '—'}
                        </td>
                        <td className="py-4 px-4 text-brand-dark">{formatCurrency(paid)}</td>
                        <td className="py-4 px-4 text-brand-dark font-medium">{formatCurrency(remaining)}</td>
                        <td className="py-4 px-4">
                          <StatusBadge type="payment" status={payStatus} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <DeleteClientButton clientId={c.id} clientName={c.name} onSuccess={fetchClients} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Collapsed Cards (<640px) */}
            <div className="sm:hidden divide-y divide-brand-border">
              {filteredClients.map((c) => {
                const mainProject = c.projects[0];
                const totalAmount = mainProject ? mainProject.totalAmount : 0;
                const paid = mainProject ? calculateTotalPaid(mainProject.payments) : 0;
                const remaining = calculateRemaining(totalAmount, paid);
                const payStatus = mainProject ? getPaymentStatus(totalAmount, paid) : 'Unpaid';

                return (
                  <div key={c.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/clients/${c.id}`} className="font-bold text-brand-dark hover:underline text-base">
                          {c.name}
                        </Link>
                        <p className="text-xs text-brand-muted">{c.email || c.phone || 'No contact'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge type="payment" status={payStatus} />
                        <DeleteClientButton clientId={c.id} clientName={c.name} onSuccess={fetchClients} />
                      </div>
                    </div>

                    <div className="text-xs text-brand-secondary space-y-1">
                      <p>
                        <strong className="text-brand-dark">Project:</strong> {mainProject ? mainProject.name : 'N/A'}
                      </p>
                      {mainProject?.scope && (
                        <p className="line-clamp-2">
                          <strong className="text-brand-dark">Scope:</strong> {mainProject.scope}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-brand-border text-brand-dark font-medium">
                      <span>Paid: {formatCurrency(paid)}</span>
                      <span>Remaining: {formatCurrency(remaining)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
