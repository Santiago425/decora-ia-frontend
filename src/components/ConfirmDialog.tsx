import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, danger, busy, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog ref={dialog} className="confirm-dialog" onCancel={onCancel} onClose={onCancel}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="confirm-actions">
        <button className="button button-ghost" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button className={`button ${danger ? 'button-danger' : 'button-primary'}`} onClick={onConfirm} disabled={busy} autoFocus>
          {busy ? 'Un momento…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
