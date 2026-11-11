import React from 'react';
import { Navbar, Nav, Container, Badge, Dropdown, Button } from 'react-bootstrap';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePos } from '../../context/PosContext';
import { ServiceDriver } from '../../services/apiClient';

export const HeaderNavbar: React.FC = () => {
  const { rol, logout, isAdmin } = useAuth();
  const { cart, driverServicio, setDriverServicio } = usePos();
  const navigate = useNavigate();
  const location = useLocation();

  const totalItemsEnCarrito = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleCerrarSesion = () => {
    logout();
    navigate('/');
  };

  const getDriverBadgeVariant = (driver: ServiceDriver) => {
    switch (driver) {
      case 'Fetch': return 'info';
      case 'Axios': return 'primary';
      case 'Alova': return 'success';
      default: return 'secondary';
    }
  };

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <Navbar expand="lg" className="tambo-navbar sticky-top shadow-sm" variant="dark">
      <Container fluid className="px-3 px-md-4">
        {/* Brand / Logo Tambo */}
        <Navbar.Brand as={NavLink} to="/" className="d-flex align-items-center gap-2 brand-logo">
          <span className="brand-icon">🏪</span>
          <div className="d-flex flex-column">
            <span className="brand-name">TAMBOPOS</span>
            <small className="brand-tagline">Sistema POS Activo (React + TSX)</small>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />

        <Navbar.Collapse id="main-navbar-nav">
          {/* Enlaces de Navegación (React Router NavLink) */}
          <Nav className="me-auto ms-lg-3 gap-1">
            <Nav.Link
              as={NavLink}
              to="/cajero"
              className={`tambo-nav-link ${isCurrent('/cajero') ? 'active' : ''}`}
            >
              <i className="bi bi-cart3 me-1"></i> Punto de Venta (Cajero)
              {totalItemsEnCarrito > 0 && (
                <Badge pill bg="warning" text="dark" className="ms-1 fw-bold">
                  {totalItemsEnCarrito}
                </Badge>
              )}
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/admin"
              className={`tambo-nav-link ${isCurrent('/admin') ? 'active' : ''}`}
            >
              <i className="bi bi-speedometer2 me-1"></i> Dashboard Admin
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/servicios-rest"
              className={`tambo-nav-link ${isCurrent('/servicios-rest') ? 'active' : ''}`}
            >
              <i className="bi bi-hdd-network me-1"></i> Servicios REST
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/guia-educativa"
              className={`tambo-nav-link ${isCurrent('/guia-educativa') ? 'active' : ''}`}
            >
              <i className="bi bi-book-half me-1"></i> Guía & Conceptos
            </Nav.Link>
          </Nav>

          {/* Selector de Driver de Servicio REST (Fetch API / Axios / Alova) */}
          <div className="d-flex align-items-center gap-2 flex-wrap mt-2 mt-lg-0">
            <Dropdown align="end">
              <Dropdown.Toggle
                size="sm"
                variant="outline-light"
                id="dropdown-service-driver"
                className="d-flex align-items-center gap-1 service-toggle"
              >
                <i className="bi bi-arrow-left-right"></i>
                <span>Driver:</span>
                <Badge bg={getDriverBadgeVariant(driverServicio)} className="text-uppercase ms-1">
                  {driverServicio}
                </Badge>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-lg">
                <Dropdown.Header className="text-muted small">
                  Seleccionar Cliente HTTP
                </Dropdown.Header>
                <Dropdown.Item
                  active={driverServicio === 'Fetch'}
                  onClick={() => setDriverServicio('Fetch')}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>📡 Fetch API (Nativo)</span>
                  {driverServicio === 'Fetch' && <i className="bi bi-check2"></i>}
                </Dropdown.Item>
                <Dropdown.Item
                  active={driverServicio === 'Axios'}
                  onClick={() => setDriverServicio('Axios')}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>⚡ Axios (Interceptors)</span>
                  {driverServicio === 'Axios' && <i className="bi bi-check2"></i>}
                </Dropdown.Item>
                <Dropdown.Item
                  active={driverServicio === 'Alova'}
                  onClick={() => setDriverServicio('Alova')}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>🚀 Alova.js (Reactive Cache)</span>
                  {driverServicio === 'Alova' && <i className="bi bi-check2"></i>}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Indicador de Rol y Botón de Cambio de Rol */}
            {rol !== 'INVITADO' ? (
              <div className="d-flex align-items-center bg-purple-dark text-white rounded-pill px-3 py-1 gap-2 border border-warning">
                <span className="small text-warning fw-semibold">
                  {isAdmin ? '🔐 Admin' : '🧑‍💼 Cajero'}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-white text-decoration-none small hover-underline"
                  onClick={handleCerrarSesion}
                  title="Cambiar de rol / Salir"
                >
                  <i className="bi bi-box-arrow-right"></i> Salir
                </Button>
              </div>
            ) : (
              <Button
                variant="warning"
                size="sm"
                className="fw-bold px-3"
                onClick={() => navigate('/')}
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
