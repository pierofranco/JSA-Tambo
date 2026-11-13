import { describe, it, expect } from 'vitest';
import { rucChecksumValido, nombrePersonaInvalido, nombreProductoInvalido, normalizarEspacios } from './validators';

describe('rucChecksumValido', () => {
  it('acepta RUCs reales con dígito verificador correcto', () => {
    expect(rucChecksumValido('20100070970')).toBe(true); // Supermercados Peruanos
    expect(rucChecksumValido('20100047218')).toBe(true); // Saga Falabella
  });

  it('rechaza formato incorrecto', () => {
    expect(rucChecksumValido('123')).toBe(false);
    expect(rucChecksumValido('abcdefghijk')).toBe(false);
  });

  it('rechaza un RUC con dígito verificador alterado', () => {
    expect(rucChecksumValido('20100070971')).toBe(false);
  });
});

describe('nombrePersonaInvalido', () => {
  it('acepta nombres válidos (incluye tildes y ñ)', () => {
    expect(nombrePersonaInvalido('Juan Pérez')).toBeNull();
    expect(nombrePersonaInvalido('María José Ñahuinlla')).toBeNull();
    expect(nombrePersonaInvalido("O'Brien")).toBeNull();
  });

  it('rechaza nombres con dígitos o símbolos', () => {
    expect(nombrePersonaInvalido('Juan123 !!')).not.toBeNull();
    expect(nombrePersonaInvalido('Test@@')).not.toBeNull();
  });

  it('rechaza nombres demasiado cortos', () => {
    expect(nombrePersonaInvalido('A')).not.toBeNull();
  });
});

describe('nombreProductoInvalido', () => {
  it('acepta nombres de producto típicos', () => {
    expect(nombreProductoInvalido('Arroz 1kg')).toBeNull();
    expect(nombreProductoInvalido('Gaseosa 1.5L')).toBeNull();
    expect(nombreProductoInvalido('Pack (2 Coca Cola 350ml)')).toBeNull();
  });

  it('rechaza solo símbolos o vacío', () => {
    expect(nombreProductoInvalido('@@##')).not.toBeNull();
    expect(nombreProductoInvalido('   ')).not.toBeNull();
    expect(nombreProductoInvalido('')).not.toBeNull();
  });
});

describe('normalizarEspacios', () => {
  it('colapsa espacios múltiples y recorta extremos', () => {
    expect(normalizarEspacios('  Arroz    Costeño  ')).toBe('Arroz Costeño');
  });
});
