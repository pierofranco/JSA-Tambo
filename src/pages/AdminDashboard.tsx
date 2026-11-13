import React, { useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { usePos } from '../context/PosContext';
import { KpiGrid } from '../components/admin/KpiGrid';
import { AnalyticsCharts } from '../components/admin/AnalyticsCharts';
import { InventoryManagement } from '../components/admin/InventoryManagement';
import { SalesHistory } from '../components/admin/SalesHistory';
import { ProveedoresCompras } from '../components/admin/ProveedoresCompras';
import { GestionarUsuarios } from '../components/admin/GestionarUsuarios';
import { LowStockModal } from '../components/admin/LowStockModal';

type AdminTab = 'resumen' | 'inventario' | 'proveedores' | 'ventas' | 'usuarios';

export const AdminDashboard: React.FC = () => {
  const { ventas, productos } = usePos();

  const [activeTab, setActiveTab] = useState<AdminTab>('resumen');
  const [mostrarAlertasStock, setMostrarAlertasStock] = useState(false);
  const [compraPrefill, setCompraPrefill] = useState<{ proveedorId: number; productoId: string } | null>(null);

  return (
    <Container fluid className="px-3 px-md-4 py-3">
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
      </div>

      {/* Tabs de Navegación del Administrador */}
      <Nav variant="pills" className="admin-nav-tabs mb-4 gap-2 border-bottom pb-2 flex-wrap">
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
            active={activeTab === 'proveedores'}
            onClick={() => setActiveTab('proveedores')}
            className="d-flex align-items-center gap-2"
          >
            <i className="bi bi-truck"></i> Proveedores & Compras
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

        <Nav.Item>
          <Nav.Link
            active={activeTab === 'usuarios'}
            onClick={() => setActiveTab('usuarios')}
            className="d-flex align-items-center gap-2"
          >
            <i className="bi bi-people"></i> Gestionar Usuarios
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Contenido según Tab Activo */}
      {activeTab === 'resumen' && (
        <div className="tab-pane-resumen">
          <KpiGrid ventas={ventas} productos={productos} onVerAlertasStock={() => setMostrarAlertasStock(true)} />
          <AnalyticsCharts ventas={ventas} productos={productos} />
        </div>
      )}

      {activeTab === 'inventario' && (
        <div className="tab-pane-inventario">
          <InventoryManagement />
        </div>
      )}

      {activeTab === 'proveedores' && (
        <div className="tab-pane-proveedores">
          <ProveedoresCompras prefill={compraPrefill} onPrefillConsumed={() => setCompraPrefill(null)} />
        </div>
      )}

      {activeTab === 'ventas' && (
        <div className="tab-pane-ventas">
          <SalesHistory ventas={ventas} />
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="tab-pane-usuarios">
          <GestionarUsuarios />
        </div>
      )}

      <LowStockModal
        show={mostrarAlertasStock}
        onHide={() => setMostrarAlertasStock(false)}
        onSolicitar={(proveedorId, productoId) => {
          setCompraPrefill({ proveedorId, productoId });
          setMostrarAlertasStock(false);
          setActiveTab('proveedores');
        }}
      />
    </Container>
  );
};
