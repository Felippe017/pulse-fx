import React from 'react';
import type { IndicatorWithLatest } from '@pulse-fx/shared';

interface IndicatorCardProps {
  indicator: IndicatorWithLatest;
  onFavoriteToggle: () => void;
  onClick: () => void;
}

export function IndicatorCard({ indicator, onFavoriteToggle, onClick }: IndicatorCardProps) {
  const {
    name,
    source,
    latestValue,
    latestDate,
    variationPercent,
    unit,
    isFavorite,
  } = indicator;

  const variationClass = variationPercent === null
    ? 'card__variation--neutral'
    : variationPercent >= 0
      ? 'card__variation--positive'
      : 'card__variation--negative';

  const variationText = variationPercent === null
    ? 'N/A'
    : `${variationPercent >= 0 ? '▲' : '▼'} ${Math.abs(variationPercent).toFixed(2)}%`;

  const formattedValue = latestValue !== null
    ? formatValue(latestValue, unit)
    : '—';

  const formattedDate = latestDate
    ? new Date(latestDate + 'T00:00:00').toLocaleDateString('pt-BR')
    : '—';

  const sourceLabel = source === 'bcb-ptax' ? 'BCB PTAX'
    : source === 'bcb-sgs' ? 'BCB SGS'
    : 'FRED';

  return (
    <article
      className="indicator-card"
      onClick={onClick}
      id={`card-${indicator.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="card__header">
        <div>
          <div className="card__name">{name}</div>
          <div className="card__source">{sourceLabel}</div>
        </div>
        <button
          className="card__favorite-btn"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          id={`fav-btn-${indicator.id}`}
          style={{ color: isFavorite ? '#fbbf24' : 'var(--color-text-muted)', display: 'flex' }}
        >
          {isFavorite ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          )}
        </button>
      </div>

      <div className="card__value-section">
        <span className="card__value">{formattedValue}</span>
        {unit && <span className="card__unit">{unit}</span>}
      </div>

      <div className="card__footer">
        <span className="card__date">{formattedDate}</span>
        <span className={`card__variation ${variationClass}`}>
          {variationText}
        </span>
      </div>
    </article>
  );
}

function formatValue(value: number, unit: string): string {
  if (unit === 'BRL') {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 4,
    });
  }

  if (unit.includes('%')) {
    return value.toFixed(2);
  }

  if (unit === 'índice') {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  }

  return value.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
}
