import React from 'react';
import { Container } from 'react-bootstrap';
import { GuideView } from '../components/educational/GuideView';

export const GuidePage: React.FC = () => {
  return (
    <Container fluid className="px-3 px-md-4 py-3">
      <GuideView />
    </Container>
  );
};

