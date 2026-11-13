import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Usuario } from '../../types/pos';
import { nombrePersonaInvalido, normalizarEspacios } from '../../../shared/validators';

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,30}$/;

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/** Campo de contraseña con botón de ojito para mostrar/ocultar el valor. */
const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, placeholder, autoFocus }) => {
  const [mostrar, setMostrar] = useState(false);
  return (
    <InputGroup>
      <Form.Control
        type={mostrar ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={6}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
      />
      <Button
        variant="outline-secondary"
        type="button"
        tabIndex={-1}
        onClick={() => setMostrar((v) => !v)}
        title={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        <i className={`bi ${mostrar ? 'bi-eye-slash' : 'bi-eye'}`}></i>
      </Button>
    </InputGroup>
  );
};

export const GestionarUsuarios: React.FC = () => {
  const { username: usernameActual } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [nuevoUsername, setNuevoUsername] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoPasswordConfirm, setNuevoPasswordConfirm] = useState('');
  const [nuevoRol, setNuevoRol] = useState<'ADMIN' | 'CAJERO'>('CAJERO');
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [modalReset, setModalReset] = useState<Usuario | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [errorReset, setErrorReset] = useState<string | null>(null);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/usuarios');
      if (!res.ok) throw new Error((await res.json()).message);
      setUsuarios(await res.json());
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar la lista de usuarios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCrear(null);

    if (!USERNAME_RE.test(nuevoUsername)) {
      setErrorCrear('El usuario debe tener 3-30 caracteres (letras, números, ._-).');
      return;
    }
    if (nuevoPassword.length < 6) {
      setErrorCrear('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevoPassword !== nuevoPasswordConfirm) {
      setErrorCrear('Las contraseñas no coinciden.');
      return;
    }
    const nombreLimpio = normalizarEspacios(nuevoNombre);
    const errorNombre = nombrePersonaInvalido(nombreLimpio);
    if (errorNombre) {
      setErrorCrear(errorNombre);
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: nuevoUsername.trim().toLowerCase(),
          password: nuevoPassword,
          nombreCompleto: nombreLimpio,
          rol: nuevoRol
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setModalCrear(false);
      setNuevoUsername('');
      setNuevoNombre('');
      setNuevoPassword('');
      setNuevoPasswordConfirm('');
      setNuevoRol('CAJERO');
      await cargarUsuarios();
    } catch (err: any) {
      setErrorCrear(err.message || 'No se pudo crear el usuario.');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActivo = async (user: Usuario) => {
    setError(null);
    try {
      const res = await fetch(`/api/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !user.activo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await cargarUsuarios();
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar el usuario.');
    }
  };

  const handleEliminar = async (user: Usuario) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al usuario "${user.username}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/usuarios/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await cargarUsuarios();
    } catch (err: any) {
      setError(err.message || 'No se pudo eliminar el usuario.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalReset) return;
    setErrorReset(null);
    if (resetPassword.length < 6) {
      setErrorReset('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (resetPassword !== resetPasswordConfirm) {
      setErrorReset('Las contraseñas no coinciden.');
      return;
    }
    try {
      const res = await fetch(`/api/usuarios/${modalReset.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setModalReset(null);
      setResetPassword('');
      setResetPasswordConfirm('');
    } catch (err: any) {
      setErrorReset(err.message || 'No se pudo restablecer la contraseña.');
    }
  };

  const renderTabla = (rol: 'ADMIN' | 'CAJERO') => {
    const filtrados = usuarios.filter((u) => u.rol === rol);
    if (filtrados.length === 0) {
      return <p className="text-muted small">No hay usuarios registrados con este rol.</p>;
    }
    return (
      <div className="table-responsive">
        <Table hover size="sm" className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((user) => (
              <tr key={user.id}>
                <td className="font-monospace">{user.username}</td>
                <td>{user.nombreCompleto}</td>
                <td>
                  {user.activo ? <Badge bg="success">Activo</Badge> : <Badge bg="secondary">Desactivado</Badge>}
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-purple"
                    className="me-1"
                    onClick={() => {
                      setModalReset(user);
                      setResetPassword('');
                      setResetPasswordConfirm('');
                      setErrorReset(null);
                    }}
                    title="Resetear contraseña"
                  >
                    <i className="bi bi-key"></i>
                  </Button>
                  <Button
                    size="sm"
                    variant={user.activo ? 'outline-warning' : 'outline-success'}
                    className="me-1"
                    onClick={() => handleToggleActivo(user)}
                    disabled={user.username === usernameActual && user.activo}
                    title={user.activo ? 'Desactivar' : 'Activar'}
                  >
                    <i className={`bi ${user.activo ? 'bi-slash-circle' : 'bi-check-circle'}`}></i>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleEliminar(user)}
                    disabled={user.username === usernameActual}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 className="m-0 fw-bold text-purple d-flex align-items-center gap-2">
          <i className="bi bi-people"></i> Gestionar Usuarios
        </h5>
        <Button variant="warning" size="sm" className="fw-bold text-purple" onClick={() => setModalCrear(true)}>
          <i className="bi bi-person-plus me-1"></i> + Nuevo Usuario
        </Button>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

        {cargando ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="purple" />
          </div>
        ) : (
          <>
            <h6 className="fw-bold text-purple mb-2">Administradores</h6>
            {renderTabla('ADMIN')}
            <hr />
            <h6 className="fw-bold text-purple mb-2">Cajeros</h6>
            {renderTabla('CAJERO')}
          </>
        )}
      </Card.Body>

      {/* Modal Crear Usuario */}
      <Modal show={modalCrear} onHide={() => setModalCrear(false)} centered>
        <Modal.Header closeButton className="bg-purple text-white">
          <Modal.Title className="fs-5 fw-bold">Nuevo Usuario</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCrear}>
          <Modal.Body>
            {errorCrear && <Alert variant="danger" className="py-2 small">{errorCrear}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Usuario:</Form.Label>
              <Form.Control
                value={nuevoUsername}
                onChange={(e) => setNuevoUsername(e.target.value)}
                placeholder="ej: jperez"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Nombre Completo:</Form.Label>
              <Form.Control value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Contraseña:</Form.Label>
              <PasswordInput value={nuevoPassword} onChange={setNuevoPassword} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Confirmar Contraseña:</Form.Label>
              <PasswordInput value={nuevoPasswordConfirm} onChange={setNuevoPasswordConfirm} />
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label className="small fw-semibold">Rol:</Form.Label>
              <Form.Select value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value as 'ADMIN' | 'CAJERO')}>
                <option value="CAJERO">Cajero</option>
                <option value="ADMIN">Administrador</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setModalCrear(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit" className="fw-bold text-purple" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Crear Usuario'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Resetear Contraseña */}
      <Modal show={!!modalReset} onHide={() => setModalReset(null)} centered>
        <Modal.Header closeButton className="bg-purple text-white">
          <Modal.Title className="fs-5 fw-bold">Resetear Contraseña: {modalReset?.username}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleResetPassword}>
          <Modal.Body>
            {errorReset && <Alert variant="danger" className="py-2 small">{errorReset}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Nueva Contraseña:</Form.Label>
              <PasswordInput value={resetPassword} onChange={setResetPassword} autoFocus />
            </Form.Group>
            <Form.Group>
              <Form.Label className="small fw-semibold">Confirmar Nueva Contraseña:</Form.Label>
              <PasswordInput value={resetPasswordConfirm} onChange={setResetPasswordConfirm} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setModalReset(null)}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit" className="fw-bold text-purple">
              Guardar Nueva Contraseña
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};
