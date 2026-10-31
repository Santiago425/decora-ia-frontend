import { describe, expect, test } from 'vitest';
import { validateEmail, validateFullName, validatePassword } from './validation';

describe('validation', () => {
  test('email', () => {
    expect(validateEmail('')).toBe('Escribe tu correo');
    expect(validateEmail('ana@')).toBe('Ese correo no parece válido');
    expect(validateEmail(' ana@correo.com ')).toBeNull();
  });

  test('password on login only requires a value', () => {
    expect(validatePassword('')).toBe('Escribe tu contraseña');
    expect(validatePassword('abc')).toBeNull();
  });

  test('password on register requires letters, numbers and length', () => {
    expect(validatePassword('abc12', { strict: true })).toBe('Usa al menos 8 caracteres');
    expect(validatePassword('solotexto', { strict: true })).toBe('Combina letras y números');
    expect(validatePassword('secreta123', { strict: true })).toBeNull();
  });

  test('full name', () => {
    expect(validateFullName(' a ')).toBe('Escribe tu nombre');
    expect(validateFullName('Ana Pérez')).toBeNull();
  });
});
