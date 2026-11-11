import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Producto } from '../../types/pos';
import { usePos } from '../../context/PosContext';

interface ProductFormModalProps {
  show: boolean;
  onHide: () => void;
  productoEditar: Producto | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ show, onHide, productoEditar }) => {
  const { crearProducto, actualizarProducto } = usePos();

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<'Bebidas' | 'Snacks' | 'Comida Rápida' | 'Abarrotes'>('Bebidas');
  const [precioRegular, setPrecioRegular] = useState<number>(0);
  const [precioOferta, setPrecioOferta] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [esPrime, setEsPrime] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  useEffect(() => {
    if (productoEditar) {
      setNombre(productoEditar.nombre);
      setCategoria(productoEditar.categoria);
      setPrecioRegular(productoEditar.precioRegular);
      setPrecioOferta(productoEditar.precioOferta);
      setStock(productoEditar.stock);
      setEsPrime(productoEditar.esPrime);
    } else {
      setNombre('');
      setCategoria('Bebidas');
      setPrecioRegular(5.00);
      setPrecioOferta(5.00);
      setStock(20);
      setEsPrime(false);
    }
    setErrorMsg(null);
  }, [productoEditar, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre del producto es requerido.');
      return;
    }
    if (precioRegular <= 0 || precioOferta <= 0) {
      setErrorMsg('Los precios deben ser mayores a 0.');
      return;
    }
    if (stock < 0) {
      setErrorMsg('El stock no puede ser negativo.');
      return;
    }

    // Calcular descuento porcentual si precio oferta < regular
    let desc = 0;
    if (precioRegular > precioOferta) {
      desc = Math.round(((precioRegular - precioOferta) / precioRegular) * 100);
    }

    setGuardando(true);
    setErrorMsg(null);
    try {
      if (productoEditar) {
        await actualizarProducto(productoEditar.id, {
          nombre,
          categoria,
          precioRegular,
          precioOferta,
          stock,
          porcentajeDescuento: desc,
          esPrime
        });
      } else {
        await crearProducto({
          nombre,
          categoria,
          precioRegular,
          precioOferta,
          stock,
          porcentajeDescuento: desc,
          esPrime,
          imagenUrl: '/assets/img/default.jpg'
        });
      }
      onHide();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-purple text-white">
        <Modal.Title className="fs-5 fw-bold">
          <i className="bi bi-box-seam me-2"></i>
          {productoEditar ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {errorMsg && <Alert variant="danger" className="py-2 small">{errorMsg}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Nombre del Producto:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Gaseosa Concordia Piña 1.5L"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Categoría:</Form.Label>
            <Form.Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as any)}
            >
              <option value="Bebidas">Bebidas</option>
              <option value="Snacks">Snacks</option>
              <option value="Comida Rápida">Comida Rápida</option>
              <option value="Abarrotes">Abarrotes</option>
            </Form.Select>
          </Form.Group>

          <Row className="g-2 mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Precio Regular (S/):</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioRegular}
                  onChange={(e) => setPrecioRegular(parseFloat(e.target.value) || 0)}
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Precio Oferta (S/):</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioOferta}
                  onChange={(e) => setPrecioOferta(parseFloat(e.target.value) || 0)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2 mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Stock Inicial:</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={6} className="d-flex align-items-center pt-3">
              <Form.Check
                type="checkbox"
                id="check-prime"
                label="Producto Prime ⭐"
                checked={esPrime}
                onChange={(e) => setEsPrime(e.target.checked)}
                className="fw-semibold text-purple"
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={onHide} disabled={guardando}>
            Cancelar
          </Button>
          <Button variant="warning" type="submit" className="fw-bold text-purple" disabled={guardando}>
            {guardando ? 'Guardando...' : productoEditar ? 'Actualizar Producto' : 'Guardar Producto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

