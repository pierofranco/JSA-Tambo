import { HttpError } from './http';
import { rucChecksumValido } from '../shared/validators';

const BASE_URL = 'https://api.decolecta.com/v1';

function getToken(): string {
  const token = process.env.DECOLECTA_TOKEN;
  if (!token) throw new Error('DECOLECTA_TOKEN no está configurado. Revisa el archivo .env.');
  return token;
}

async function callDecolecta(path: string): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    let body: any = {};
    try {
      body = await res.json();
    } catch {
      /* respuesta sin JSON */
    }
    const message = body.message || body.error || `El servicio de consulta respondió con estado ${res.status}.`;
    throw new HttpError(res.status === 404 ? 404 : 422, message);
  }

  return res.json();
}

export interface RucInfo {
  ruc: string;
  razonSocial: string;
  estado: string;
}

export async function consultarRucReal(ruc: string): Promise<RucInfo> {
  if (!/^\d{11}$/.test(ruc)) {
    throw new HttpError(400, 'RUC inválido. Debe contener exactamente 11 dígitos.');
  }
  if (!rucChecksumValido(ruc)) {
    // Rechazo rápido por dígito verificador, sin gastar cupo de la API externa.
    throw new HttpError(422, 'RUC inválido.');
  }
  try {
    const data = await callDecolecta(`/sunat/ruc?numero=${encodeURIComponent(ruc)}`);
    return {
      ruc: data.numero_documento || ruc,
      razonSocial: data.razon_social || '',
      estado: [data.estado, data.condicion].filter(Boolean).join(' / ') || 'DESCONOCIDO'
    };
  } catch (err) {
    // Unifica el mensaje: Decolecta devuelve textos como "ruc no valido" que
    // no queremos mostrar tal cual en la UI.
    if (err instanceof HttpError) throw new HttpError(err.status, 'RUC inválido.');
    throw err;
  }
}

export interface DniInfo {
  dni: string;
  nombreCompleto: string;
}

export async function consultarDniReal(dni: string): Promise<DniInfo> {
  if (!/^\d{8}$/.test(dni)) {
    throw new HttpError(400, 'DNI inválido. Debe contener exactamente 8 dígitos.');
  }
  if (/^(\d)\1{7}$/.test(dni)) {
    // Rechazo rápido de DNIs obviamente falsos (00000000, 11111111, ...) sin
    // gastar cupo de la API externa.
    throw new HttpError(422, 'DNI inválido.');
  }
  const data = await callDecolecta(`/reniec/dni?numero=${encodeURIComponent(dni)}`);
  if (!data.full_name) {
    throw new HttpError(404, 'No se encontró a ninguna persona con ese DNI.');
  }
  return {
    dni: data.document_number || dni,
    nombreCompleto: data.full_name
  };
}
