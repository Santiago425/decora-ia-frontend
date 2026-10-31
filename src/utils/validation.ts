const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Escribe tu correo';
  return EMAIL.test(email.trim()) ? null : 'Ese correo no parece válido';
}

export function validatePassword(password: string, { strict = false } = {}): string | null {
  if (!password) return 'Escribe tu contraseña';
  if (!strict) return null;
  if (password.length < 8) return 'Usa al menos 8 caracteres';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Combina letras y números';
  if (new TextEncoder().encode(password).length > 72) return 'La contraseña es demasiado larga';
  return null;
}

export function validateFullName(name: string): string | null {
  const clean = name.trim().replace(/\s+/g, ' ');
  if (clean.length < 2) return 'Escribe tu nombre';
  return clean.length > 120 ? 'El nombre es demasiado largo' : null;
}
