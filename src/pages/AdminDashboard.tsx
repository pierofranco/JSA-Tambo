import React, { useState } from 'react';
import { Container, Nav, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePos } from '../context/PosContext';
import { KpiGrid } from '../components/admin/KpiGrid';
import { AnalyticsCharts } from '../components/admin/AnalyticsCharts';
import { InventoryManagement } from '../components/admin/InventoryManagement';
import { SalesHistory } from '../components/admin/SalesHistory';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, loginCajero } = useAuth();
  const { ventas, productos } = usePos();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'resumen' | 'inventario' | 'ventas'>('resumen');

  const handleCambiarACajero = () => {
    loginCajero();
    navigate('/cajero');
  };

  return (
    <Container fluid className="px-3 px-md-4 py-3">
      {/* Banner de acceso de administrador */}
      {!isAdmin && (
        <Alert variant="warning" className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <i className="bi bi-shield-exclamation me-2"></i>
            Estás visualizando el panel como <strong>Invitado / Demo</strong>. Para privilegios de administrador completos, inicia sesión con el PIN (1234).
          </div>
          <Button variant="outline-dark" size="sm" onClick={() => navigate('/')}>
            Ingresar PIN
          </Button>
        </Alert>
      )}

      {/* Header del Dashboard */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-purple m-0 d-flex align-items-center gap-2">
            <i className="bi bi-speedometer2"></i> Dashboard Administrativo TAMBOPOS
          </h3>
          <p className="text-muted small m-0">
            Control de inventario en tiempo real, KPIs financieros y auditoría de ventas.
          </p>
        </div>

        <Button
          variant="outline-purple"
          className="d-flex align-items-center gap-2 fw-semibold"
          onClick={handleCambiarACajero}
        >
          <span>🧑‍💼</span> Cambiar a Modo Cajero
        </Button>
      </div>

      {/* Tabs de Navegación del Administrador */}
      <Nav variant="pills" className="admin-nav-tabs mb-4 gap-2 border-bottom pb-2">
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'resumen'}
            onClick={() => setActiveTab('resumen')}
            className="d-flex align-items-center gap-2"
          >
            <i className="bi bi-graph-up"></i> Resumen General
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link
            active={activeTab === 'inventario'}
            onClick={() => setActiveTab('inventario')}
            className="d-flex align-items-center gap-2"
          >
            <i className="bi bi-boxes"></i> Gestión de Inventario ({productos.length})
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link
            active={activeTab === 'ventas'}
            onClick={() => setActiveTab('ventas')}
            className="d-flex align-items-center gap-2"
          >
            <i className="bi bi-receipt-cutoff"></i> Historial de Ventas ({ventas.length})
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Contenido según Tab Activo */}
      {activeTab === 'resumen' && (
        <div className="tab-pane-resumen">
          <KpiGrid ventas={ventas} productos={productos} />
          <AnalyticsCharts ventas={ventas} />
        </div>
      )}

      {activeTab === 'inventario' && (
        <div className="tab-pane-inventario">
          <InventoryManagement />
        </div>
      )}

      {activeTab === 'ventas' && (
        <div className="tab-pane-ventas">
          <SalesHistory ventas={ventas} />
        </div>
      )}
    </Container>
  );
};

