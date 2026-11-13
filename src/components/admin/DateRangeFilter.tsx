import React from 'react';
import { Form, Button, ButtonGroup } from 'react-bootstrap';
import { formatDateInput, hoy, hoyMenosDias } from '../../utils/dateRange';

interface DateRangeFilterProps {
  desde: string;
  hasta: string;
  onChange: (desde: string, hasta: string) => void;
}

/** Filtro de rango de fechas reutilizable: inputs de fecha + atajos 30/60/90 días. */
export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ desde, hasta, onChange }) => {
  const aplicarRapido = (dias: number) => {
    onChange(formatDateInput(hoyMenosDias(dias)), formatDateInput(hoy()));
  };

  return (
    <div className="d-flex flex-wrap align-items-end gap-2">
      <Form.Group>
        <Form.Label className="small text-muted mb-1">Desde:</Form.Label>
        <Form.Control
          type="date"
          size="sm"
          value={desde}
          max={hasta || undefined}
          onChange={(e) => onChange(e.target.value, hasta)}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className="small text-muted mb-1">Hasta:</Form.Label>
        <Form.Control
          type="date"
          size="sm"
          value={hasta}
          min={desde || undefined}
          onChange={(e) => onChange(desde, e.target.value)}
        />
      </Form.Group>
      <ButtonGroup size="sm">
        <Button variant="outline-purple" onClick={() => aplicarRapido(30)}>
          30 días
        </Button>
        <Button variant="outline-purple" onClick={() => aplicarRapido(60)}>
          60 días
        </Button>
        <Button variant="outline-purple" onClick={() => aplicarRapido(90)}>
          90 días
        </Button>
      </ButtonGroup>
      {(desde || hasta) && (
        <Button variant="outline-secondary" size="sm" onClick={() => onChange('', '')}>
          <i className="bi bi-x-circle me-1"></i>
          Limpiar
        </Button>
      )}
    </div>
  );
};
