import React, { useState } from 'react';
import { Card, Button, Form, Alert, Row, Col, Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleSelector: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const result = await login(username.trim(), password);
      if (result.ok) {
        navigate(result.rol === 'ADMIN' ? '/admin' : '/cajero');
      } else {
        setError(result.mensaje || 'Usuario o contraseña incorrectos.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5}>
          <Card className="selector-rol-card shadow border-0 text-center p-4">
            <div className="brand-badge-tambo mx-auto mb-3">
              <span className="display-4">🏪</span>
            </div>

            <h2 className="fw-bold text-purple mb-1">Bienvenido a TAMBOPOS</h2>
            <p className="text-muted small mb-4">
              Sistema POS Web implementado con React, TypeScript, Bootstrap y Servicios REST
            </p>

            <Form onSubmit={handleSubmit} className="text-start">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-purple">Usuario:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-purple">Contraseña:</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              {error && (
                <Alert variant="danger" className="py-2 px-2 small mb-3">
                  {error}
                </Alert>
              )}

              <Button variant="purple" type="submit" className="w-100 fw-bold py-2" disabled={cargando}>
                {cargando ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" /> Ingresando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </Form>

            {/* Accesos rápidos a los temas pedagógicos (públicos) */}
            <div className="border-top pt-3 mt-4">
              <div className="small text-muted mb-2 fw-semibold">Exploradores Técnicos del Proyecto:</div>
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <Button variant="outline-secondary" size="sm" onClick={() => navigate('/servicios-rest')}>
                  <i className="bi bi-hdd-network me-1"></i> Servicios REST (Fetch/Axios/Alova)
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => navigate('/guia-educativa')}>
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
