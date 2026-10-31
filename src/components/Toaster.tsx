import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { notificationCenter, type Notification } from '../services/notificationCenter';

const ICONS = { success: CheckCircle2, info: Info, error: XCircle };
const VISIBLE_MS = 3800;

export function Toaster() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(
    () =>
      notificationCenter.subscribe((notification) => {
        setItems((current) => [...current, notification]);
        setTimeout(() => setItems((current) => current.filter((n) => n.id !== notification.id)), VISIBLE_MS);
      }),
    [],
  );

  return (
    <div className="toaster" aria-live="polite">
      {items.map(({ id, tone, message }) => {
        const Icon = ICONS[tone];
        return (
          <div key={id} className={`toast toast-${tone}`}>
            <Icon size={18} />
            {message}
          </div>
        );
      })}
    </div>
  );
}
