import type { User } from '../../types/auth';

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export function Avatar({ user, size = 38 }: { user: User; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size }} aria-hidden="true">
      {initials(user.full_name)}
    </span>
  );
}
