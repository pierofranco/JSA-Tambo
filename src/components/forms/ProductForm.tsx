import React, { useState } from 'react';
import { Producto, CategoriaProducto } from '../../types';
import { useStore } from '../../hooks/useStore';
import { fetchService } from '../../services/fetchService';
import { axiosService } from '../../services/axiosService';
import { alovaService } from '../../services/alovaService';

interface ProductFormProps {
  onProductoCreado: (nuevoProd: Producto) => void;
  onCancelar?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onProductoCreado, onCancelar }) => {
  const { servicioRestActivo } = useStore();

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<CategoriaProducto>('Bebidas');
  const [precioRegular, setPrecioRegular] = useState<number | ''>('');
  const [precioOferta, setPrecioOferta] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [porcentajeDescuento, setPorcentajeDescuento] = useState<number>(0);
  const [esPrime, setEsPrime] = useState(false);
  const [imagenUrl, setImagenUrl] = useState('');

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Cálculo automático del porcentaje de descuento al cambiar precios
  const handlePrecioRegularChange = (val: number | '') => {
    setPrecioRegular(val);
    if (typeof val === 'number' && typeof precioOferta === 'number' && val > 0 && precioOferta <= val) {
      const desc = Math.round(((val - precioOferta) / val) * 100);
      setPorcentajeDescuento(desc);
    }
  };

  const handlePrecioOfertaChange = (val: number | '') => {
    setPrecioOferta(val);
    if (typeof val === 'number' && typeof precioRegular === 'number' && precioRegular > 0 && val <= precioRegular) {
      const desc = Math.round(((precioRegular - val) / precioRegular) * 100);
      setPorcentajeDescuento(desc);
    }
  };

  const validarFormulario = (): boolean => {
    const errs: Record<string, string> = {};

    if (!nombre.trim()) {
      errs.nombre = 'El nombre del producto es obligatorio';
    } else if (nombre.trim().length < 3) {
      errs.nombre = 'Debe tener al menos 3 caracteres';
    }

    if (precioRegular === '' || Number(precioRegular) <= 0) {
      errs.precioRegular = 'El precio regular debe ser mayor a 0';
    }

    if (precioOferta === '' || Number(precioOferta) <= 0) {
      errs.precioOferta = 'El precio de oferta debe ser mayor a 0';
    } else if (Number(precioOferta) > Number(precioRegular)) {
      errs.precioOferta = 'El precio de oferta no puede superar el precio regular';
    }

    if (stock === '' || Number(stock) < 0) {
      errs.stock = 'El stock debe ser un entero positivo o 0';
    }

    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setGuardando(true);
    setMensajeExito(null);

    const payload: Omit<Producto, 'id'> = {
      nombre: nombre.trim(),
      categoria,
      precioRegular: Number(precioRegular),
      precioOferta: Number(precioOferta),
      stock: Number(stock),
      porcentajeDescuento,
      esPrime,
      imagenUrl: imagenUrl.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'
    };

    try {
      let resultado;
      if (servicioRestActivo === 'Axios') {
        resultado = await axiosService.createProducto(payload);
      } else if (servicioRestActivo === 'Alova') {
        resultado = await alovaService.createProducto(payload);
      } else {
        resultado = await fetchService.createProducto(payload);
      }

      if (resultado.data) {
        setMensajeExito(`¡Producto ${resultado.data.nombre} creado vía ${resultado.cliente}! (Status: ${resultado.status})`);
        onProductoCreado(resultado.data);
        // Reset form
        setNombre('');
        setPrecioRegular('');
        setPrecioOferta('');
        setStock('');
        setPorcentajeDescuento(0);
        setEsPrime(false);
        setImagenUrl('');
      }
    } catch (err: any) {
      setErrores({ submit: err.message || 'Error al guardar producto' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0 text-tambo-purple d-flex align-items-center gap-2">
          <i className="bi bi-plus-square-fill text-tambo-yellow"></i>
          <span>Registrar Nuevo Producto</span>
        </h5>
        <span className="badge bg-secondary">
          Cliente REST: {servicioRestActivo}
        </span>
      </div>

      {mensajeExito && (
        <div className="alert alert-success alert-dismissible fade show small py-2 mb-3" role="alert">
          <i className="bi bi-check-circle me-1"></i> {mensajeExito}
          <button type="button" className="btn-close py-2" onClick={() => setMensajeExito(null)}></button>
        </div>
      )}

      {errores.submit && (
        <div className="alert alert-danger py-2 small mb-3">
          <i className="bi bi-exclamation-triangle me-1"></i> {errores.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          {/* Nombre */}
          <div className="col-12 col-md-8">
            <label className="form-label small fw-semibold">Nombre del Producto *</label>
            <input
              type="text"
              className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
              placeholder="Ej: Gatorade Manzana 750ml"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
          </div>

          {/* Categoría */}
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold">Categoría *</label>
            <select
              className="form-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaProducto)}
            >
              <option value="Bebidas">Bebidas</option>
              <option value="Snacks">Snacks</option>
              <option value="Comida Rápida">Comida Rápida</option>
              <option value="Abarrotes">Abarrotes</option>
            </select>
          </div>

          {/* Precio Regular */}
          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold">Precio Regular (S/) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`form-control ${errores.precioRegular ? 'is-invalid' : ''}`}
              placeholder="0.00"
              value={precioRegular}
              onChange={(e) => handlePrecioRegularChange(e.target.value === '' ? '' : Number(e.target.value))}
            />
            {errores.precioRegular && <div className="invalid-feedback">{errores.precioRegular}</div>}
          </div>

          {/* Precio Oferta */}
          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold">Precio Oferta (S/) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`form-control ${errores.precioOferta ? 'is-invalid' : ''}`}
              placeholder="0.00"
              value={precioOferta}
              onChange={(e) => handlePrecioOfertaChange(e.target.value === '' ? '' : Number(e.target.value))}
            />
            {errores.precioOferta && <div className="invalid-feedback">{errores.precioOferta}</div>}
          </div>

          {/* Stock */}
          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold">Stock Inicial *</label>
            <input
              type="number"
              min="0"
              className={`form-control ${errores.stock ? 'is-invalid' : ''}`}
              placeholder="25"
              value={stock}
              onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
            />
            {errores.stock && <div className="invalid-feedback">{errores.stock}</div>}
          </div>

          {/* % Descuento Calculado */}
          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold">Descuento (%)</label>
            <input
              type="text"
              className="form-control bg-light"
              value={`${porcentajeDescuento}%`}
              readOnly
            />
          </div>

          {/* URL Imagen */}
          <div className="col-12 col-md-8">
            <label className="form-label small fw-semibold">URL de Imagen (Opcional)</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
            />
          </div>

          {/* Checkbox Prime */}
          <div className="col-12 col-md-4 d-flex align-items-end">
            <div className="form-check pb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="checkEsPrime"
                checked={esPrime}
                onChange={(e) => setEsPrime(e.target.checked)}
              />
              <label className="form-check-label fw-semibold small" htmlFor="checkEsPrime">
                Producto Tambo Prime
              </label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="col-12 d-flex justify-content-end gap-2 pt-2 border-top">
            {onCancelar && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancelar}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="btn btn-tambo-purple d-flex align-items-center gap-2"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Guardando vía {servicioRestActivo}...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-arrow-up-fill"></i>
                  <span>Guardar Producto en Inventario</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
