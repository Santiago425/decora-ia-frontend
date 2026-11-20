import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Close when the dark area around the dialog is clicked. */
  closeOnBackdrop?: boolean;
}

export function Modal({ open, title, onClose, children, footer, className, closeOnBackdrop }: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  useEffect(() => {
    const element = dialog.current;
    if (!element || !closeOnBackdrop) return;
    // With no padding on the dialog, only a click on the backdrop lands on the dialog element itself.
    // The keyboard way out is Escape, which the dialog already handles.
    const onBackdrop = (event: MouseEvent) => {
      if (event.target === element) onClose();
    };
    element.addEventListener('click', onBackdrop);
    return () => element.removeEventListener('click', onBackdrop);
  }, [closeOnBackdrop, onClose]);

  return (
    <dialog
      ref={dialog}
      className={['modal', className].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="modal-body">
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
      {footer && <div className="modal-footer">{footer}</div>}
    </dialog>
  );
}
