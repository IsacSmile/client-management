'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  clientName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  clientName,
  onClose,
  onConfirm,
  isDeleting = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-5 shadow-xl shadow-zinc-950/5 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 tracking-tight">{title}</h3>
              <p className="text-xs text-zinc-500 font-normal">This action requires confirmation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-zinc-600">
          <p className="text-sm">
            Are you sure you want to delete <strong className="font-semibold text-zinc-900">{clientName}</strong>?
          </p>
          <div className="p-3.5 border border-zinc-200/60 bg-zinc-50/80 rounded-xl text-xs space-y-1.5 text-zinc-700">
            <p className="font-semibold text-zinc-900">Permanent Deletion Warning:</p>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-500">
              <li>Client profile and contact details</li>
              <li>All associated project records</li>
              <li>Complete payment history ledger</li>
            </ul>
            <p className="pt-1 font-medium text-rose-600">This action cannot be undone.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
