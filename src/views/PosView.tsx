import React, { useState, useMemo } from 'react';
import { ProductCard } from '../components/pos/ProductCard';
import { ProductFilter } from '../components/pos/ProductFilter';
import { CartSidebar } from '../components/pos/CartSidebar';
import { TicketModal } from '../components/pos/TicketModal';
import { useResource } from '../hooks/useResource';
import { useDebounce } from '../hooks/useDebounce';
import { useCart } from '../hooks/useCart';
import { useStore } from '../hooks/useStore';
import { fetchService } from '../services/fetchService';
import { axiosService } from '../services/axiosService';
import { alovaService } from '../services/alovaService';
import { CategoriaProducto, Producto } from '../types';

export const PosView: React.FC = () => {
  const { ultimoTicket, despejarUltimoTicket } = useCart();
  const { servicioRestActivo } = useStore();

  const [categoria, setCategoria] = useState<CategoriaProducto>('TODAS');
  const [busqueda, setBusqueda] = useState<string>('');
  const [soloOfertas, setSoloOfertas] = useState<boolean>(false);
  const [soloPrime, setSoloPrime] = useState<boolean>(false);

  // Hook State con debounce para búsqueda optimizada
  const busquedaDebounced = useDebounce(busqueda, 250);

  // Resource Hook para cargar productos mediante el cliente REST activo
  const { data: productos, loading, error, reload } = useResource<Producto[]>(
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

  // Filtrado reactivo de productos
  const productosFiltrados = useMemo(() => {
    if (!productos) return [];

    return productos.filter(p => {
      const matchCat = categoria === 'TODAS' || p.categoria === categoria;
      const matchText = busquedaDebounced.trim() === '' ||
        p.nombre.toLowerCase().includes(busquedaDebounced.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busquedaDebounced.toLowerCase());
      const matchOferta = !soloOfertas || p.porcentajeDescuento > 0;
      const matchPrime = !soloPrime || p.esPrime;

      return matchCat && matchText && matchOferta && matchPrime;
    });
  }, [productos, categoria, busquedaDebounced, soloOfertas, soloPrime]);

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Banner de Bienvenida Tambo */}
      <div className="bg-tambo-purple text-white p-3 p-md-4 rounded-4 mb-4 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2 className="fw-black mb-1 text-tambo-yellow">
            <i className="bi bi-shop me-2"></i>POS TIENDAS TAMBO
          </h2>
          <p className="mb-0 text-white-50">
            Sistema Punto de Venta Activo • Desarrollado con React 18, TypeScript, Bootstrap 5 y Hooks
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 rounded-pill px-3"
            onClick={() => reload()}
            title="Recargar catálogo vía servicio REST"
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>Sincronizar Catálogo ({servicioRestActivo})</span>
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* COLUMNA IZQUIERDA: Catálogo y Filtros */}
        <div className="col-12 col-lg-8">
          {/* Filtros */}
          <ProductFilter
            categoriaSeleccionada={categoria}
            onSelectCategoria={setCategoria}
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            soloOfertas={soloOfertas}
            onToggleOfertas={() => setSoloOfertas(!soloOfertas)}
            soloPrime={soloPrime}
            onTogglePrime={() => setSoloPrime(!soloPrime)}
          />

          {/* Estado de Carga */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
              <p className="mt-3 text-muted fw-semibold">Cargando inventario desde REST Service ({servicioRestActivo})...</p>
            </div>
          )}

          {/* Estado de Error */}
          {error && (
            <div className="alert alert-danger shadow-sm rounded-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Error al consultar catálogo: {error}
            </div>
          )}

          {/* Grid de Productos */}
          {!loading && !error && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">
                  Mostrando <strong>{productosFiltrados.length}</strong> de {productos?.length || 0} productos
                </span>
                {categoria !== 'TODAS' && (
                  <span className="badge bg-light text-dark border">
                    Filtro: {categoria}
                  </span>
                )}
              </div>

              {productosFiltrados.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 border">
                  <i className="bi bi-search display-5 text-muted mb-3 d-block"></i>
                  <h5>No se encontraron productos</h5>
                  <p className="text-muted small">Prueba cambiando la categoría o los términos de búsqueda.</p>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setCategoria('TODAS');
                      setBusqueda('');
                      setSoloOfertas(false);
                      setSoloPrime(false);
                    }}
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : (
                <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3">
                  {productosFiltrados.map(producto => (
                    <div key={producto.id} className="col">
                      <ProductCard producto={producto} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* COLUMNA DERECHA: Carrito y Comprobante */}
        <div className="col-12 col-lg-4">
          <CartSidebar onTicketGenerado={() => {}} />
        </div>
      </div>

      {/* Modal de Ticket con Ref Hook */}
      <TicketModal
        ticket={ultimoTicket}
        onCerrar={despejarUltimoTicket}
      />
    </div>
  );
};

