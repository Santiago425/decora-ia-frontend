import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { notificationCenter, type Notification } from '../services/notificationCenter';

const ICONS = { success: CheckCircle2, info: Info, error: XCircle };
const VISIBLE_MS = 3800;
const WITH_ACTION_MS = 7000;

export function Toaster() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(
    () =>
      notificationCenter.subscribe((notification) => {
        setItems((current) => [...current, notification]);
        setTimeout(
          () => setItems((current) => current.filter((n) => n.id !== notification.id)),
          notification.action ? WITH_ACTION_MS : VISIBLE_MS,
        );
      }),
    [],
  );

  const dismiss = (id: number) => setItems((current) => current.filter((n) => n.id !== id));

  return (
    <div className="toaster" aria-live="polite">
      {items.map(({ id, tone, message, action }) => {
        const Icon = ICONS[tone];
        return (
          <div key={id} className={`toast toast-${tone} ${action ? 'has-action' : ''}`}>
            <Icon size={18} />
            <span className="toast-message">{message}</span>
            {action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  action.run();
                  dismiss(id);
                }}
              >
                {action.label}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
