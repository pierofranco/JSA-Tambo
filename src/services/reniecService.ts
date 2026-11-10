import { Cliente, RestClientType, RestExecutionResult } from '../types';
import { fetchService } from './fetchService';
import { axiosService } from './axiosService';
import { alovaService } from './alovaService';

/**
 * SERVICIO DE CONSULTA DE IDENTIFICACIÓN (DNI / RUC / PADRÓN)
 * Permite cambiar dinámicamente entre Fetch API, Axios y Alova
 * para demostrar el consumo de servicios REST.
 */
export async function consultarDocumentoIdentidad(
  tipoDoc: string,
  numDoc: string,
  clienteHttp: RestClientType = 'Fetch API'
): Promise<RestExecutionResult<Cliente>> {
  switch (clienteHttp) {
    case 'Axios':
      return axiosService.getClientePorDoc(numDoc);
    case 'Alova':
      return alovaService.getClientePorDoc(numDoc);
    case 'Fetch API':
    default:
      return fetchService.getClientePorDoc(numDoc);
  }
}

