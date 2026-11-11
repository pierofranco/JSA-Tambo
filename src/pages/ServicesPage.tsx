import React from 'react';
import { Container } from 'react-bootstrap';
import { RestExplorer } from '../components/services/RestExplorer';

export const ServicesPage: React.FC = () => {
  return (
    <Container fluid className="px-3 px-md-4 py-3">
      <RestExplorer />
    </Container>
  );
};

