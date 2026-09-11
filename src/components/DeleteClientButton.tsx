'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Toast } from '@/components/Toast';

interface DeleteClientButtonProps {
  clientId: string;
  clientName: string;
  onSuccess?: () => void;
  variant?: 'icon' | 'button';
}

export function DeleteClientButton({
  clientId,
  clientName,
  onSuccess,
  variant = 'icon',
}: DeleteClientButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setIsOpen(false);
        setToastMessage(`Client "${clientName}" deleted successfully`);
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete client');
      }
    } catch (err) {
      console.error('Delete client error:', err);
      alert('An error occurred while deleting client');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title={`Delete ${clientName}`}
          className="p-1.5 text-brand-muted hover:text-brand-dark hover:bg-brand-surface rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-brand-dark border border-brand-dark rounded-md hover:bg-brand-nav transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      )}

      <ConfirmModal
        isOpen={isOpen}
        title="Delete Client Profile"
        clientName={clientName}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </>
  );
}
