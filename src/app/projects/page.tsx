'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { DeleteClientButton } from '@/components/DeleteClientButton';
import { calculateTotalPaid, calculateRemaining, formatCurrency, getInitials } from '@/lib/finance';
import { Briefcase, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TableSkeleton } from '@/components/skeletons';

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

  const activeProjectsCount = projects.filter((p) => p.status !== 'Completed').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'Completed').length;

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

        {/* Top 2 Summary Cards (2 in one row on mobile) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-3.5 sm:p-5 space-y-1.5 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 truncate">Active Projects</span>
              <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shrink-0">
                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">{activeProjectsCount}</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-3.5 sm:p-5 space-y-1.5 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 truncate">Completed</span>
              <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">{completedProjectsCount}</p>
          </div>
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
          <TableSkeleton rows={5} cols={7} />
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center text-zinc-400 text-xs sm:text-sm space-y-3 shadow-sm">
            <Briefcase className="w-8 h-8 text-zinc-300 mx-auto" />
            <p>No projects found matching your criteria.</p>
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table Container */}
            <div className="hidden sm:block bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
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
            </div>

            {/* Breathable Mobile Cards with Small Typography (<640px) */}
            <div className="sm:hidden space-y-3 pt-1">
              {filteredProjects.map((p) => {
                const paid = calculateTotalPaid(p.payments);
                const remaining = calculateRemaining(p.totalAmount, paid);

                return (
                  <div key={p.id} className="p-3.5 border border-zinc-200/80 rounded-xl bg-white space-y-2.5 shadow-2xs hover:border-zinc-300 transition-all">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-semibold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                          {getInitials(p.client.name)}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/clients/${p.client.id}`} className="font-semibold text-zinc-900 hover:underline text-xs sm:text-sm truncate block">
                            {p.name}
                          </Link>
                          <p className="text-[11px] text-zinc-400 font-normal truncate mt-0.5">{p.client.name} • {p.progress}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusBadge type="project" status={p.status} />
                        <DeleteClientButton clientId={p.client.id} clientName={p.client.name} onSuccess={fetchProjects} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-zinc-50/80 p-2 rounded-lg border border-zinc-100/90">
                      <span className="text-zinc-500">Paid: <strong className="text-emerald-700 font-semibold">{formatCurrency(paid)}</strong></span>
                      <span className="text-zinc-500">Remaining: <strong className={`font-semibold ${remaining > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>{formatCurrency(remaining)}</strong></span>
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
