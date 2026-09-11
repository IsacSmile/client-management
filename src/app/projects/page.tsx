'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { DeleteClientButton } from '@/components/DeleteClientButton';
import { calculateTotalPaid, calculateRemaining, formatCurrency, getInitials } from '@/lib/finance';
import { Briefcase, Search, ArrowRight } from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  scope: string;
  totalAmount: number;
  status: string;
  progress: number;
  client: {
    id: string;
    name: string;
  };
  payments: { amount: number }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const clients = await res.json();
        const allProjects: ProjectItem[] = [];
        clients.forEach((c: any) => {
          c.projects.forEach((p: any) => {
            allProjects.push({
              ...p,
              client: { id: c.id, name: c.name },
            });
          });
        });
        setProjects(allProjects);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return p.name.toLowerCase().includes(query) || p.client.name.toLowerCase().includes(query);
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50/50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Projects</h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">Track ongoing deliverables, completion progress, and project values</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <span>+ Add Client & Project</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name or client name..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-sm"
          />
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center text-zinc-400 text-xs sm:text-sm shadow-sm">
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center text-zinc-400 text-xs sm:text-sm space-y-3 shadow-sm">
            <Briefcase className="w-8 h-8 text-zinc-300 mx-auto" />
            <p>No projects found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
            {/* Desktop & Tablet Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/60">
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Total Value</th>
                    <th className="py-3.5 px-4">Total Paid</th>
                    <th className="py-3.5 px-4">Remaining</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredProjects.map((p) => {
                    const paid = calculateTotalPaid(p.payments);
                    const remaining = calculateRemaining(p.totalAmount, paid);

                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-zinc-900">
                          <Link href={`/clients/${p.client.id}`} className="hover:text-zinc-600 transition-colors">
                            {p.name}
                          </Link>
                          <span className="text-xs text-zinc-400 block font-normal mt-0.5">
                            Progress: {p.progress}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                              {getInitials(p.client.name)}
                            </div>
                            <Link href={`/clients/${p.client.id}`} className="font-semibold text-zinc-900 hover:underline">
                              {p.client.name}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge type="project" status={p.status} />
                        </td>
                        <td className="py-3.5 px-4 text-zinc-900 font-medium">{formatCurrency(p.totalAmount)}</td>
                        <td className="py-3.5 px-4 text-zinc-700 font-medium">{formatCurrency(paid)}</td>
                        <td className={`py-3.5 px-4 font-semibold ${remaining > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>{formatCurrency(remaining)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/clients/${p.client.id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
                            >
                              <span>Details</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                            <DeleteClientButton clientId={p.client.id} clientName={p.client.name} onSuccess={fetchProjects} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Redesigned Mobile Collapsed Cards (<640px) */}
            <div className="sm:hidden p-3 space-y-3 bg-zinc-50/40">
              {filteredProjects.map((p) => {
                const paid = calculateTotalPaid(p.payments);
                const remaining = calculateRemaining(p.totalAmount, paid);

                return (
                  <div key={p.id} className="p-4 border border-zinc-200/80 rounded-2xl bg-white shadow-xs hover:shadow-md transition-all space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-zinc-800">
                          {getInitials(p.client.name)}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/clients/${p.client.id}`} className="font-bold text-zinc-900 hover:text-zinc-600 transition-colors text-sm truncate block">
                            {p.name}
                          </Link>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">Client: {p.client.name}</p>
                        </div>
                      </div>
                      <StatusBadge type="project" status={p.status} />
                    </div>

                    {/* 3-Column Financial Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-zinc-50/80 rounded-xl border border-zinc-200/60 text-center">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TOTAL</span>
                        <span className="text-xs font-semibold text-zinc-900">{formatCurrency(p.totalAmount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600/90 uppercase tracking-wider block">PAID</span>
                        <span className="text-xs font-semibold text-emerald-700">{formatCurrency(paid)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-rose-500/90 uppercase tracking-wider block">DUE</span>
                        <span className={`text-xs font-bold ${remaining > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>{formatCurrency(remaining)}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between border-t border-zinc-100">
                      <span className="text-xs text-zinc-400">Progress: {p.progress}%</span>
                      <Link
                        href={`/clients/${p.client.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-900 transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
