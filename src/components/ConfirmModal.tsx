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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-brand-border rounded-lg p-6 space-y-4 shadow-none">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-brand-border rounded-md bg-brand-surface text-brand-dark">
              <AlertTriangle className="w-5 h-5 text-brand-dark" />
            </div>
            <h3 className="text-lg font-semibold text-brand-dark">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-brand-muted hover:text-brand-dark rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-sm text-brand-secondary">
          <p>
            Are you sure you want to delete <strong className="text-brand-dark">{clientName}</strong>?
          </p>
          <div className="p-3 border border-brand-border bg-brand-surface rounded-md text-xs space-y-1 text-brand-dark">
            <p className="font-semibold text-brand-dark">Permanent Deletion Warning:</p>
            <ul className="list-disc list-inside space-y-0.5 text-brand-secondary">
              <li>Client profile and contact details</li>
              <li>All associated project records</li>
              <li>Complete payment history ledger</li>
            </ul>
            <p className="pt-1 font-medium text-brand-dark">This action cannot be undone.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-brand-dark bg-white border border-brand-border rounded-md hover:bg-brand-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-dark border border-brand-dark rounded-md hover:bg-brand-nav transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
