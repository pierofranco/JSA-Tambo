import React from 'react';
import { useResource } from '../../hooks/useResource';
import { fetchService } from '../../services/fetchService';
import { axiosService } from '../../services/axiosService';
import { alovaService } from '../../services/alovaService';
import { useStore } from '../../hooks/useStore';
import { Producto } from '../../types';

export const ResourceHooksDemo: React.FC = () => {
  const { servicioRestActivo } = useStore();

  // Resource Hook cargando los productos a través del servicio REST activo
  const { data: productos, loading, error, timestamp, reload, mutate } = useResource<Producto[]>(
    async () => {
      let res;
      if (servicioRestActivo === 'Axios') {
        res = await axiosService.getProductos();
      } else if (servicioRestActivo === 'Alova') {
        res = await alovaService.getProductos();
      } else {
        res = await fetchService.getProductos();
      }
      return res.data;
    },
    [servicioRestActivo] // Recarga reactivamente cuando cambia el cliente REST
  );

  const handleSimularMutacionOptimista = () => {
    mutate(prev => {
      if (!prev) return [];
      const prodCopia = [...prev];
      if (prodCopia.length > 0) {
        prodCopia[0] = {
          ...prodCopia[0],
          nombre: `${prodCopia[0].nombre} (¡Mutado Optimista!)`
        };
      }
      return prodCopia;
    });
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4">
      <div className="card-header bg-white border-0 pt-3 pb-0">
        <h5 className="fw-bold text-tambo-purple mb-1">
          <i className="bi bi-cloud-arrow-down-fill me-2 text-success"></i>
          4. Resource Hooks: <code>useResource</code> (Gestión de Recursos Asíncronos)
        </h5>
        <p className="text-muted small mb-0">
          Encapsulan el ciclo de vida de peticiones asíncronas REST, manejando estados de <code>data</code>, <code>loading</code>, <code>error</code>, revalidación y mutación optimista.
        </p>
      </div>

      <div className="card-body">
        {/* Barra de control del recurso */}
        <div className="d-flex flex-wrap align-items-center justify-content-between bg-light p-3 rounded-3 mb-3 border gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-dark">Fuente: {servicioRestActivo}</span>
            {timestamp && (
              <span className="small text-muted">
                Última sincronización: <strong>{timestamp.toLocaleTimeString()}</strong>
              </span>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              onClick={() => reload()}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <i className="bi bi-arrow-clockwise"></i>
              )}
              <span>Recargar Recurso</span>
            </button>

            <button
              className="btn btn-sm btn-outline-warning text-dark d-flex align-items-center gap-1"
              onClick={handleSimularMutacionOptimista}
              disabled={loading || !productos || productos.length === 0}
            >
              <i className="bi bi-pencil-square"></i>
              <span>Mutar Localmente (.mutate)</span>
            </button>
          </div>
        </div>

        {/* Estado Loading */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="small text-muted mt-2">Cargando recurso asíncrono con Resource Hook...</p>
          </div>
        )}

        {/* Estado Error */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-octagon-fill fs-5"></i>
            <div>
              <strong>Error en el recurso:</strong> {error}
            </div>
          </div>
        )}

        {/* Estado Exitoso: Datos */}
        {!loading && !error && productos && (
          <div className="table-responsive rounded-3 border">
            <table className="table table-hover table-sm align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Oferta</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.slice(0, 5).map(prod => (
                  <tr key={prod.id}>
                    <td><code>{prod.id}</code></td>
                    <td className="fw-semibold small">{prod.nombre}</td>
                    <td><span className="badge bg-secondary small">{prod.categoria}</span></td>
                    <td className="text-success fw-bold small">S/ {prod.precioOferta.toFixed(2)}</td>
                    <td className="small">{prod.stock} un.</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-2 bg-light text-center small text-muted border-top">
              Mostrando los primeros 5 de {productos.length} productos gestionados por el Resource Hook.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

