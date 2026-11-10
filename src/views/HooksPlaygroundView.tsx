import React from 'react';
import { StateHooksDemo } from '../components/hooks/StateHooksDemo';
import { ContextHooksDemo } from '../components/hooks/ContextHooksDemo';
import { RefHooksDemo } from '../components/hooks/RefHooksDemo';
import { ResourceHooksDemo } from '../components/hooks/ResourceHooksDemo';

export const HooksPlaygroundView: React.FC = () => {
  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-tambo-purple mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-lightning-charge-fill text-tambo-yellow"></i>
          <span>Módulo 3: Laboratorio Exhaustivo de Hooks en React</span>
        </h3>
        <p className="text-muted small mb-0">
          Demostración práctica interactiva de State Hooks, Context Hooks, Ref Hooks y Resource Hooks aplicados a la arquitectura POS.
        </p>
      </div>

      {/* Tabla Resumen de Clasificación de Hooks */}
      <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
        <div className="card-header bg-dark text-white py-2 small fw-bold">
          <i className="bi bi-table me-2"></i>Clasificación y Aplicación de Hooks en el Proyecto Tambo
        </div>
        <div className="table-responsive">
          <table className="table table-sm table-striped align-middle mb-0 small">
            <thead className="table-secondary">
              <tr>
                <th>Categoría</th>
                <th>Hooks Principales</th>
                <th>Propósito en React</th>
                <th>Implementación en Tambo POS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge bg-primary">State Hooks</span></td>
                <td><code>useState</code>, <code>useReducer</code></td>
                <td>Almacenar información mutable que dispara re-renderizados cuando cambia.</td>
                <td>Filtros de búsqueda, modales y máquina de estados del carrito (<code>cartReducer</code>).</td>
              </tr>
              <tr>
                <td><span className="badge bg-info text-dark">Context Hooks</span></td>
                <td><code>createContext</code>, <code>useContext</code></td>
                <td>Compartir datos globales en el árbol de componentes sin pasar props manualmente.</td>
                <td><code>CartContext</code> para items del carrito y <code>StoreContext</code> para cajero y sucursal.</td>
              </tr>
              <tr>
                <td><span className="badge bg-danger">Ref Hooks</span></td>
                <td><code>useRef</code></td>
                <td>Referenciar nodos del DOM nativo y retener valores mutables sin causar re-render.</td>
                <td>Foco automático en lector de DNI, impresión del ticket y temporizador de sesión.</td>
              </tr>
              <tr>
                <td><span className="badge bg-success">Resource Hooks</span></td>
                <td><code>useResource</code>, <code>useAlova</code></td>
                <td>Gestión asíncrona del ciclo de vida de peticiones REST (data, loading, error, mutate).</td>
                <td>Consumo reactivo de productos e invalidación de caché ante modificaciones.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Demos Interactivos */}
      <StateHooksDemo />
      <ContextHooksDemo />
      <RefHooksDemo />
      <ResourceHooksDemo />
    </div>
  );
};

