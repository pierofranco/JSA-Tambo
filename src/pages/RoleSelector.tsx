import React, { useState } from 'react';
import { Card, Button, Form, Alert, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleSelector: React.FC = () => {
  const { loginCajero, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [mostrarPinBox, setMostrarPinBox] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [errorPin, setErrorPin] = useState<string | null>(null);

  const handleEntrarCajero = () => {
    loginCajero();
    navigate('/cajero');
  };

  const handleEntrarAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPin(null);

    const ok = loginAdmin(pin.trim());
    if (ok) {
      navigate('/admin');
    } else {
      setErrorPin('PIN incorrecto. (El PIN por defecto de Administrador es: 1234)');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="selector-rol-card shadow border-0 text-center p-4">
            <div className="brand-badge-tambo mx-auto mb-3">
              <span className="display-4">🏪</span>
            </div>

            <h2 className="fw-bold text-purple mb-1">Bienvenido a TAMBOPOS</h2>
            <p className="text-muted small mb-4">
              Sistema POS Web implementado con React, TypeScript, Bootstrap y Servicios REST
            </p>

            {/* Botones de Selección de Rol */}
            <div className="d-grid gap-3 mb-4">
              <Button
                variant="purple"
                size="lg"
                className="btn-rol-custom py-3 d-flex align-items-center justify-content-center gap-3 fw-bold"
                onClick={handleEntrarCajero}
              >
                <span className="fs-3">🧑‍💼</span>
                <div className="text-start">
                  <div>Ingresar como Cajero</div>
                  <small className="fw-normal opacity-75">Punto de venta, carrito, boletas y facturas</small>
                </div>
              </Button>

              <Button
                variant="outline-purple"
                size="lg"
                className="btn-rol-custom py-3 d-flex align-items-center justify-content-center gap-3 fw-bold"
                onClick={() => setMostrarPinBox(!mostrarPinBox)}
              >
                <span className="fs-3">🔐</span>
                <div className="text-start">
                  <div>Ingresar como Administrador</div>
                  <small className="fw-normal opacity-75">Dashboard, inventario, reportes y ventas</small>
                </div>
              </Button>
            </div>

            {/* Caja de PIN de Administrador (Formulario Controlado) */}
            {mostrarPinBox && (
              <div className="admin-login-box p-3 bg-light rounded border text-start mb-4">
                <Form onSubmit={handleEntrarAdmin}>
                  <Form.Group className="mb-2">
                    <Form.Label className="fw-semibold small text-purple">
                      PIN de Administrador:
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="•••• (PIN: 1234)"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      autoFocus
                    />
                    <Form.Text className="text-muted small">
                      Ingresa <strong>1234</strong> para acceder al panel de administración.
                    </Form.Text>
                  </Form.Group>

                  {errorPin && (
                    <Alert variant="danger" className="py-1 px-2 small mb-2">
                      {errorPin}
                    </Alert>
                  )}

                  <Button variant="warning" type="submit" className="w-100 fw-bold text-purple mt-2">
                    Acceder al Panel Admin
                  </Button>
                </Form>
              </div>
            )}

            {/* Accesos rápidos a los temas pedagógicos */}
            <div className="border-top pt-3 mt-2">
              <div className="small text-muted mb-2 fw-semibold">Exploradores Técnicos del Proyecto:</div>
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => navigate('/servicios-rest')}
                >
                  <i className="bi bi-hdd-network me-1"></i> Servicios REST (Fetch/Axios/Alova)
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => navigate('/guia-educativa')}
                >
                  <i className="bi bi-book-half me-1"></i> Guía & Conceptos de React
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

