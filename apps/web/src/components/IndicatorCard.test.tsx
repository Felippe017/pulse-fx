import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { IndicatorCard } from '../components/IndicatorCard';
import type { IndicatorWithLatest } from '@pulse-fx/shared';
import { describe, it, expect, vi } from 'vitest';

const mockIndicator: IndicatorWithLatest = {
  id: 1,
  source: 'bcb-ptax',
  externalId: 'USD',
  name: 'Dólar PTAX (Venda)',
  description: 'Taxa de câmbio USD/BRL',
  frequency: 'daily',
  unit: 'BRL',
  latestValue: 5.4532,
  latestDate: '2024-01-15',
  variationPercent: 1.25,
  previousValue: 5.3860,
  isFavorite: false,
};

function renderCard(
  indicator: IndicatorWithLatest = mockIndicator,
  onFavoriteToggle = vi.fn(),
  onClick = vi.fn(),
) {
  return render(
    <BrowserRouter>
      <IndicatorCard
        indicator={indicator}
        onFavoriteToggle={onFavoriteToggle}
        onClick={onClick}
      />
    </BrowserRouter>,
  );
}

describe('IndicatorCard', () => {
  it('should render indicator name', () => {
    renderCard();
    expect(screen.getByText('Dólar PTAX (Venda)')).toBeInTheDocument();
  });

  it('should render source label', () => {
    renderCard();
    expect(screen.getByText('BCB PTAX')).toBeInTheDocument();
  });

  it('should render formatted date', () => {
    renderCard();
    expect(screen.getByText('15/01/2024')).toBeInTheDocument();
  });

  it('should render positive variation with ▲', () => {
    renderCard();
    expect(screen.getByText('▲ 1.25%')).toBeInTheDocument();
  });

  it('should render negative variation with ▼', () => {
    renderCard({ ...mockIndicator, variationPercent: -0.5 });
    expect(screen.getByText('▼ 0.50%')).toBeInTheDocument();
  });

  it('should render N/A when variation is null', () => {
    renderCard({ ...mockIndicator, variationPercent: null });
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should show ☆ when not favorite', () => {
    renderCard({ ...mockIndicator, isFavorite: false });
    expect(screen.getByText('☆')).toBeInTheDocument();
  });

  it('should show ⭐ when favorite', () => {
    renderCard({ ...mockIndicator, isFavorite: true });
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('should call onFavoriteToggle when star is clicked', () => {
    const onFavoriteToggle = vi.fn();
    renderCard(mockIndicator, onFavoriteToggle);

    fireEvent.click(screen.getByLabelText('Adicionar aos favoritos'));
    expect(onFavoriteToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onClick when card is clicked', () => {
    const onClick = vi.fn();
    renderCard(mockIndicator, vi.fn(), onClick);

    fireEvent.click(screen.getByRole('button', { name: /Dólar PTAX/i }).closest('.indicator-card')!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not propagate click to card when star is clicked', () => {
    const onFavoriteToggle = vi.fn();
    const onClick = vi.fn();
    renderCard(mockIndicator, onFavoriteToggle, onClick);

    fireEvent.click(screen.getByLabelText('Adicionar aos favoritos'));
    expect(onFavoriteToggle).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
