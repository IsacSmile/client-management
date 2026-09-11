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
    let Icon = CircleDashed;
    if (payStatus === 'Paid') Icon = CheckCheck;
    if (payStatus === 'Partial Payment') Icon = CircleDot;
    if (payStatus === 'Unpaid') Icon = AlertCircle;

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-brand-border rounded-md bg-brand-surface text-brand-dark">
        <Icon className="w-3.5 h-3.5 text-brand-dark" />
        <span>{payStatus}</span>
      </span>
    );
  }

  // Project Status
  const projStatus = status as ProjectStatus;
  const label = PROJECT_STATUS_LABELS[projStatus] || status;

  let Icon = Clock;
  if (projStatus === 'Completed') Icon = CheckCircle2;
  if (projStatus === 'InProgress') Icon = CircleDot;
  if (projStatus === 'NotStarted') Icon = CircleDashed;
  if (projStatus === 'WaitingForClient') Icon = AlertCircle;
  if (projStatus === 'OnHold') Icon = PauseCircle;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-brand-border rounded-md bg-white text-brand-dark">
      <Icon className="w-3.5 h-3.5 text-brand-muted" />
      <span>{label}</span>
    </span>
  );
}
