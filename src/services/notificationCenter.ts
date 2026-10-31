export type NotificationTone = 'success' | 'info' | 'error';

export interface Notification {
  id: number;
  tone: NotificationTone;
  message: string;
}

type Listener = (notification: Notification) => void;

// Observer: any part of the app publishes a notification and every subscriber reacts to it.
class NotificationCenter {
  #listeners = new Set<Listener>();
  #nextId = 1;

  subscribe(listener: Listener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  notify(message: string, tone: NotificationTone = 'info'): Notification {
    const notification = { id: this.#nextId++, tone, message };
    this.#listeners.forEach((listener) => listener(notification));
    return notification;
  }
}

export const notificationCenter = new NotificationCenter();
