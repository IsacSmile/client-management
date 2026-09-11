import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CircleDashed, 
  PauseCircle, 
  IndianRupee, 
  CheckCheck,
  CircleDot
} from 'lucide-react';
import { PaymentStatus, ProjectStatus, PROJECT_STATUS_LABELS } from '@/lib/finance';

interface StatusBadgeProps {
  type: 'project' | 'payment';
  status: string;
}

export function StatusBadge({ type, status }: StatusBadgeProps) {
  if (type === 'payment') {
    const payStatus = status as PaymentStatus;
    let badgeStyle = 'bg-zinc-100 text-zinc-700 border-zinc-200/80';
    let dotStyle = 'bg-zinc-500';

    if (payStatus === 'Paid') {
      badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-2xs';
      dotStyle = 'bg-emerald-500';
    } else if (payStatus === 'Partial Payment') {
      badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-2xs';
      dotStyle = 'bg-amber-500';
    } else if (payStatus === 'Unpaid') {
      badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200/80 shadow-2xs';
      dotStyle = 'bg-rose-500';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold border rounded-full ${badgeStyle}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotStyle} shrink-0`} />
        <span>{payStatus}</span>
      </span>
    );
  }

  // Project Status
  const projStatus = status as ProjectStatus;
  const label = PROJECT_STATUS_LABELS[projStatus] || status;

  let badgeStyle = 'bg-zinc-100 text-zinc-700 border-zinc-200/80';
  let dotStyle = 'bg-zinc-500';

  if (projStatus === 'Completed') {
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-2xs';
    dotStyle = 'bg-emerald-500';
  } else if (projStatus === 'InProgress') {
    badgeStyle = 'bg-sky-50 text-sky-800 border-sky-200/80 shadow-2xs';
    dotStyle = 'bg-sky-500';
  } else if (projStatus === 'WaitingForClient') {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-2xs';
    dotStyle = 'bg-amber-500';
  } else if (projStatus === 'OnHold') {
    badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200/80 shadow-2xs';
    dotStyle = 'bg-rose-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold border rounded-full ${badgeStyle}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyle} shrink-0`} />
      <span>{label}</span>
    </span>
  );
}
