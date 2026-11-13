/**
 * Validadores de formato compartidos entre frontend y backend. El backend
 * nunca debe confiar solo en la validación del cliente, así que estas mismas
 * reglas se vuelven a aplicar en server/routes/*.ts.
 */

/** Colapsa espacios múltiples y recorta los extremos. */
export function normalizarEspacios(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ');
}

/**
 * Dígito verificador de RUC peruano (Módulo 11, algoritmo SUNAT).
 * Factores 5,4,3,2,7,6,5,4,3,2 sobre los primeros 10 dígitos.
 */
export function rucChecksumValido(ruc: string): boolean {
  if (!/^\d{11}$/.test(ruc)) return false;
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digitos = ruc.split('').map(Number);
  const suma = factores.reduce((acc, factor, i) => acc + factor * digitos[i], 0);
  const resto = suma % 11;
  let digitoVerificador = 11 - resto;
  if (digitoVerificador === 10) digitoVerificador = 0;
  else if (digitoVerificador === 11) digitoVerificador = 1;
  return digitoVerificador === digitos[10];
}

const NOMBRE_PERSONA_RE = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ' -]+$/;

/** Nombre completo de persona: solo letras/tildes/ñ, espacios, apóstrofe y guion; 2-80 caracteres. */
export function nombrePersonaInvalido(nombre: string): string | null {
  const limpio = normalizarEspacios(nombre);
  if (limpio.length < 2 || limpio.length > 80) {
    return 'El nombre debe tener entre 2 y 80 caracteres.';
  }
  if (!NOMBRE_PERSONA_RE.test(limpio)) {
    return 'El nombre solo puede contener letras y espacios (sin números ni símbolos).';
  }
  return null;
}

const NOMBRE_PRODUCTO_RE = /^[A-Za-z0-9À-ÖØ-öø-ÿÑñ.,\-/%&() ]+$/;

/** Nombre de producto: letras, números, espacios y . , - / % & ( ); 2-100 caracteres. */
export function nombreProductoInvalido(nombre: string): string | null {
  const limpio = normalizarEspacios(nombre);
  if (limpio.length < 2 || limpio.length > 100) {
    return 'El nombre del producto debe tener entre 2 y 100 caracteres.';
  }
  if (!NOMBRE_PRODUCTO_RE.test(limpio)) {
    return 'El nombre contiene caracteres no permitidos.';
  }
  if (!/[A-Za-z0-9À-ÖØ-öø-ÿÑñ]/.test(limpio)) {
    return 'El nombre no puede ser solo símbolos.';
  }
  return null;
}
