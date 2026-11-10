import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useStore } from '../../hooks/useStore';

export const Navbar: React.FC = () => {
  const { totalUnidades } = useCart();
  const { servicioRestActivo, setServicioRestActivo, cajeroActivo } = useStore();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-tambo-purple shadow-sm sticky-top">
      <div className="container-fluid px-lg-4">
        {/* Brand / Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <span
            className="d-inline-flex justify-content-center align-items-center bg-tambo-yellow text-dark rounded-3 px-2 py-1 fw-black"
            style={{ fontSize: '1.2rem', minWidth: '36px' }}
          >
            T
          </span>
          <span className="fs-5 tracking-wide">
            TAMBO<span className="text-tambo-yellow">+</span> <span className="badge bg-light text-dark fs-7 py-1 px-2 rounded-pill ms-1">POS REACT</span>
          </span>
        </Link>

        {/* Toggle button para móvil */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#tamboNavbar"
          aria-controls="tamboNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links de Navegación de Elementos de React */}
        <div className="collapse navbar-collapse" id="tamboNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-1">
            <li className="nav-nav-item">
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active-tambo' : ''}`}
                end
              >
                <i className="bi bi-cart4 me-1"></i> Punto de Venta (POS)
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/productos"
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active-tambo' : ''}`}
              >
                <i className="bi bi-box-seam me-1"></i> Inventario & CRUD
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/conceptos-react"
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active-tambo' : ''}`}
              >
                <i className="bi bi-mortarboard me-1"></i> Introducción (JSX vs TSX)
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/hooks"
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active-tambo' : ''}`}
              >
                <i className="bi bi-lightning-charge me-1"></i> Laboratorio Hooks
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/servicios"
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active-tambo' : ''}`}
              >
                <i className="bi bi-cloud-arrow-down me-1"></i> Servicios REST
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/integracion"
                className={({ isActive }) => `nav-link px-3 ${isActive ? 'active-tambo' : ''}`}
              >
                <i className="bi bi-diagram-3 me-1"></i> Integración Total
              </NavLink>
            </li>
          </ul>

          {/* Selector de Cliente REST y Carrito */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Indicador de REST Activo */}
            <div className="d-none d-xl-flex align-items-center bg-white bg-opacity-10 text-white rounded-pill px-3 py-1 text-sm border border-white border-opacity-25">
              <i className="bi bi-broadcast me-1 text-tambo-yellow"></i>
              <span className="me-2" style={{ fontSize: '0.82rem' }}>REST Activo:</span>
              <select
                className="form-select form-select-sm bg-transparent text-white border-0 fw-semibold py-0 ps-1 pe-4"
                style={{ width: 'auto', cursor: 'pointer', outline: 'none' }}
                value={servicioRestActivo}
                onChange={(e) => setServicioRestActivo(e.target.value as any)}
              >
                <option value="Fetch API" className="text-dark">Fetch API</option>
                <option value="Axios" className="text-dark">Axios</option>
                <option value="Alova" className="text-dark">Alova</option>
              </select>
            </div>

            {/* Cajero */}
            <span className="badge bg-warning text-dark d-none d-md-inline-block px-2 py-2">
              <i className="bi bi-person-badge me-1"></i> {cajeroActivo.split(' ')[0]}
            </span>

            {/* Botón Carrito */}
            <Link
              to="/"
              className="btn btn-tambo-yellow d-flex align-items-center gap-2 py-1 px-3 rounded-pill position-relative"
            >
              <i className="bi bi-basket-fill fs-6"></i>
              <span>Carrito</span>
              <span className="badge bg-danger rounded-pill px-2 py-1 text-white">
                {totalUnidades}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

