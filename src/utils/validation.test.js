import { describe, test, expect } from 'vitest';
import { isHttpUrl } from './validation.js';

describe('isHttpUrl', () => {
  describe('URLs http/https válidas', () => {
    test.each([
      ['http simple', 'http://example.com'],
      ['https simple', 'https://example.com'],
      ['con puerto', 'http://localhost:3000'],
      ['con ruta y query', 'https://example.com/ruta?color=azul&estilo=moderno'],
      ['con fragmento', 'https://example.com/pagina#seccion'],
    ])('acepta %s', (_nombre, url) => {
      expect(isHttpUrl(url)).toBe(true);
    });

    test.each([
      ['HTTP://example.com'],
      ['HTTPS://EXAMPLE.COM'],
    ])('acepta el esquema en mayúsculas: %s', (url) => {
      expect(isHttpUrl(url)).toBe(true);
    });
  });

  describe('esquemas peligrosos o no permitidos', () => {
    test.each([
      ['javascript:', 'javascript:alert(1)'],
      ['file:', 'file:///C:/Users/archivo.txt'],
      ['ftp:', 'ftp://example.com/archivo.txt'],
      ['data:', 'data:text/plain;base64,SGVsbG8='],
    ])('rechaza %s', (_nombre, url) => {
      expect(isHttpUrl(url)).toBe(false);
    });
  });

  describe('valores vacíos', () => {
    test.each([
      ['cadena vacía', ''],
      ['null', null],
      ['undefined', undefined],
    ])('rechaza %s', (_nombre, valor) => {
      expect(isHttpUrl(valor)).toBe(false);
    });
  });

  describe('valores que no son una URL', () => {
    test.each([
      ['texto cualquiera', 'esto no es una url'],
      ['dominio sin esquema', 'example.com'],
      ['solo el esquema', 'https://'],
    ])('rechaza %s', (_nombre, valor) => {
      expect(isHttpUrl(valor)).toBe(false);
    });

    test.each([
      ['número', 123],
      ['cero', 0],
      ['objeto', {}],
      ['arreglo vacío', []],
    ])('rechaza %s', (_nombre, valor) => {
      expect(isHttpUrl(valor)).toBe(false);
    });
  });

  describe('límite de 2048 caracteres', () => {
    const prefijo = 'https://example.com/';

    test('acepta una URL de exactamente 2048 caracteres', () => {
      const url = prefijo + 'a'.repeat(2048 - prefijo.length);
      expect(url).toHaveLength(2048);
      expect(isHttpUrl(url)).toBe(true);
    });

    test('rechaza una URL de 2049 caracteres', () => {
      const url = prefijo + 'a'.repeat(2049 - prefijo.length);
      expect(url).toHaveLength(2049);
      expect(isHttpUrl(url)).toBe(false);
    });
  });
});
