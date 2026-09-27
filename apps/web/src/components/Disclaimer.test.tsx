import React from 'react';
import { render, screen } from '@testing-library/react';
import { Disclaimer } from '../components/Disclaimer';
import { describe, it, expect } from 'vitest';

describe('Disclaimer', () => {
  it('should render the disclaimer text', () => {
    render(<Disclaimer />);
    expect(screen.getByText(/educacional e informativo/i)).toBeInTheDocument();
  });

  it('should contain investment warning', () => {
    render(<Disclaimer />);
    expect(screen.getByText(/não constitui recomendação de investimento/i)).toBeInTheDocument();
  });

  it('should mention data sources', () => {
    render(<Disclaimer />);
    expect(screen.getByText(/BCB/)).toBeInTheDocument();
    expect(screen.getByText(/FRED/)).toBeInTheDocument();
  });

  it('should have correct id for testing', () => {
    const { container } = render(<Disclaimer />);
    expect(container.querySelector('#disclaimer')).toBeInTheDocument();
  });
});
