import React from 'react';
import { CategoriaProducto } from '../../types';

interface ProductFilterProps {
  categoriaSeleccionada: CategoriaProducto;
  onSelectCategoria: (cat: CategoriaProducto) => void;
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  soloOfertas: boolean;
  onToggleOfertas: () => void;
  soloPrime: boolean;
  onTogglePrime: () => void;
}

const CATEGORIAS: CategoriaProducto[] = ['TODAS', 'Bebidas', 'Snacks', 'Comida Rápida', 'Abarrotes'];

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categoriaSeleccionada,
  onSelectCategoria,
  busqueda,
  onBusquedaChange,
  soloOfertas,
  onToggleOfertas,
  soloPrime,
  onTogglePrime
}) => {
  return (
    <div className="card shadow-sm border-0 mb-4 p-3 rounded-4">
      <div className="row g-3 align-items-center">
        {/* Input de Búsqueda */}
        <div className="col-12 col-md-5">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              placeholder="Buscar productos (ej. Inca Kola, Pringles...)"
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
            />
            {busqueda && (
              <button
                className="btn btn-light border"
                type="button"
                onClick={() => onBusquedaChange('')}
              >
                <i className="bi bi-x-lg text-muted"></i>
              </button>
            )}
          </div>
        </div>

        {/* Botones de Categorías */}
        <div className="col-12 col-md-7 d-flex flex-wrap gap-1 align-items-center justify-content-md-end">
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm rounded-pill px-3 py-1 ${
                categoriaSeleccionada === cat
                  ? 'btn-tambo-purple shadow-sm'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => onSelectCategoria(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filtros rápidos: Ofertas y Prime */}
        <div className="col-12 d-flex gap-3 align-items-center pt-2 border-top">
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="switchOfertas"
              checked={soloOfertas}
              onChange={onToggleOfertas}
            />
            <label className="form-check-label small fw-semibold" htmlFor="switchOfertas">
              <i className="bi bi-tag-fill text-danger me-1"></i> Solo en Oferta
            </label>
          </div>

          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="switchPrime"
              checked={soloPrime}
              onChange={onTogglePrime}
            />
            <label className="form-check-label small fw-semibold" htmlFor="switchPrime">
              <i className="bi bi-star-fill text-warning me-1"></i> Solo Tambo Prime
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

