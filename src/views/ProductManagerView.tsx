import React, { useState } from 'react';
import { ProductForm } from '../components/forms/ProductForm';
import { useResource } from '../hooks/useResource';
import { useStore } from '../hooks/useStore';
import { fetchService } from '../services/fetchService';
import { axiosService } from '../services/axiosService';
import { alovaService } from '../services/alovaService';
import { Producto } from '../types';

export const ProductManagerView: React.FC = () => {
  const { servicioRestActivo } = useStore();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  // Resource Hook para cargar y gestionar productos
  const { data: productos, loading, error, reload, mutate } = useResource<Producto[]>(
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
    [servicioRestActivo]
  );

  const handleProductoCreado = (nuevoProd: Producto) => {
    mutate(prev => prev ? [nuevoProd, ...prev] : [nuevoProd]);
    setMostrarFormulario(false);
    setMensaje({ tipo: 'success', texto: `Producto "${nuevoProd.nombre}" añadido exitosamente al inventario.` });
  };

  const handleEliminarProducto = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return;

    setEliminandoId(id);
    try {
      let res;
      if (servicioRestActivo === 'Axios') {
        res = await axiosService.deleteProducto(id);
      } else if (servicioRestActivo === 'Alova') {
        res = await alovaService.deleteProducto(id);
      } else {
        res = await fetchService.deleteProducto(id);
      }

      mutate(prev => prev ? prev.filter(p => p.id !== id) : []);
      setMensaje({ tipo: 'success', texto: `${res.data?.mensaje || 'Producto eliminado'} vía ${res.cliente}` });
    } catch (err: any) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al eliminar producto' });
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-tambo-purple mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-boxes text-tambo-yellow"></i>
            <span>Gestión de Inventario & Productos</span>
          </h3>
          <p className="text-muted small mb-0">
            Administración CRUD de productos conectada en tiempo real a servicios REST ({servicioRestActivo}).
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={() => reload()}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>Actualizar</span>
          </button>

          <button
            className={`btn btn-sm ${mostrarFormulario ? 'btn-secondary' : 'btn-tambo-purple'} d-flex align-items-center gap-1`}
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <i className={`bi ${mostrarFormulario ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
            <span>{mostrarFormulario ? 'Cerrar Formulario' : 'Nuevo Producto'}</span>
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show small py-2 mb-3`} role="alert">
          <i className={`bi ${mensaje.tipo === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-1`}></i>
          {mensaje.texto}
          <button type="button" className="btn-close py-2" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      {/* Formulario Expandible */}
      {mostrarFormulario && (
        <div className="mb-4">
          <ProductForm
            onProductoCreado={handleProductoCreado}
            onCancelar={() => setMostrarFormulario(false)}
          />
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">
            Catálogo Registrado ({productos?.length || 0} productos)
          </h6>
          <span className="badge bg-light text-dark border">
            REST: {servicioRestActivo}
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-muted">
                <th>SKU</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio Reg.</th>
                <th>Oferta</th>
                <th>Desc.</th>
                <th>Stock</th>
                <th>Prime</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    <span className="text-muted small">Cargando inventario...</span>
                  </td>
                </tr>
              ) : productos && productos.length > 0 ? (
                productos.map(p => (
                  <tr key={p.id}>
                    <td><code>{p.id}</code></td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={p.imagenUrl}
                          alt={p.nombre}
                          className="rounded"
                          style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/40';
                          }}
                        />
                        <div>
                          <div className="fw-semibold small">{p.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border small">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="small text-muted">S/ {p.precioRegular.toFixed(2)}</td>
                    <td className="small fw-bold text-success">S/ {p.precioOferta.toFixed(2)}</td>
                    <td>
                      {p.porcentajeDescuento > 0 ? (
                        <span className="badge bg-danger small">-{p.porcentajeDescuento}%</span>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${p.stock > 10 ? 'bg-success' : p.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td>
                      {p.esPrime ? (
                        <span className="badge bg-warning text-dark small">Prime</span>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger py-0 px-2"
                        onClick={() => handleEliminarProducto(p.id, p.nombre)}
                        disabled={eliminandoId === p.id}
                        title="Eliminar producto"
                      >
                        {eliminandoId === p.id ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          <i className="bi bi-trash"></i>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-muted small">
                    No hay productos en el inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

