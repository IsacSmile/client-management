'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { calculateTotalPaid, calculateRemaining, formatCurrency } from '@/lib/finance';
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Projects</h1>
            <p className="text-sm text-brand-secondary mt-1">Track ongoing deliverables, completion progress, and project values</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-nav hover:bg-brand-dark text-white text-sm font-medium rounded-md border border-brand-dark transition-colors"
          >
            <span>+ Add Client & Project</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name or client name..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark focus:outline-none focus:border-brand-dark transition-colors"
          />
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="bg-white border border-brand-border rounded-lg p-12 text-center text-brand-muted text-sm">
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-lg p-12 text-center text-brand-muted text-sm space-y-3">
            <Briefcase className="w-8 h-8 text-brand-muted mx-auto" />
            <p>No projects found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white border border-brand-border rounded-lg overflow-hidden">
            {/* Desktop & Tablet Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-xs font-semibold text-brand-secondary uppercase tracking-wider bg-brand-surface">
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Total Paid</th>
                    <th className="py-3.5 px-4">Remaining</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredProjects.map((p) => {
                    const paid = calculateTotalPaid(p.payments);
                    const remaining = calculateRemaining(p.totalAmount, paid);

                    return (
                      <tr key={p.id} className="hover:bg-brand-surface/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-brand-dark">
                          <Link href={`/clients/${p.client.id}`} className="hover:underline">
                            {p.name}
                          </Link>
                          <span className="text-xs text-brand-muted block font-normal mt-0.5">
                            Progress: {p.progress}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-brand-secondary">
                          <Link href={`/clients/${p.client.id}`} className="hover:underline">
                            {p.client.name}
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge type="project" status={p.status} />
                        </td>
                        <td className="py-4 px-4 text-brand-dark">{formatCurrency(paid)}</td>
                        <td className="py-4 px-4 text-brand-dark font-medium">{formatCurrency(remaining)}</td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/clients/${p.client.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark hover:underline"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Collapsed Cards (<640px) */}
            <div className="sm:hidden divide-y divide-brand-border">
              {filteredProjects.map((p) => {
                const paid = calculateTotalPaid(p.payments);
                const remaining = calculateRemaining(p.totalAmount, paid);

                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/clients/${p.client.id}`} className="font-bold text-brand-dark hover:underline text-base">
                          {p.name}
                        </Link>
                        <p className="text-xs text-brand-secondary">Client: {p.client.name}</p>
                      </div>
                      <StatusBadge type="project" status={p.status} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-brand-dark pt-1 border-t border-brand-border">
                      <span>Total Paid: {formatCurrency(paid)}</span>
                      <span>Remaining: {formatCurrency(remaining)}</span>
                    </div>

                    <div className="pt-1 text-right">
                      <Link
                        href={`/clients/${p.client.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark hover:underline"
                      >
                        <span>View Client & Payment Details</span>
                        <ArrowRight className="w-3 h-3" />
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
