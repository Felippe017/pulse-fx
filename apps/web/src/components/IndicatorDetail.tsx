import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIndicatorDetail } from '../hooks/useIndicatorDetail';
import { IndicatorChart } from './Chart';

const DAILY_PERIODS = [
  { label: '30D', days: 30 },
  { label: '60D', days: 60 },
  { label: '90D', days: 90 },
];

const MONTHLY_PERIODS = [
  { label: '6M', months: 6 },
  { label: '12M', months: 12 },
  { label: '24M', months: 24 },
];

export function IndicatorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState(2); // Default: último período

  const indicatorId = parseInt(id ?? '0', 10);

  // Primeiro fetch para saber a frequência
  const { detail, loading, error } = useIndicatorDetail(indicatorId);

  const periods = detail?.frequency === 'daily' ? DAILY_PERIODS : MONTHLY_PERIODS;
  const currentPeriod = periods[selectedPeriod] ?? periods[periods.length - 1];

  // Filtrar observações pelo período selecionado
  const filteredObservations = useMemo(() => {
    if (!detail?.observations) return [];

    const now = new Date();
    let cutoff: Date;

    if ('days' in currentPeriod) {
      cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - (currentPeriod as { days: number; label: string }).days);
    } else {
      cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - (currentPeriod as { months: number; label: string }).months);
    }

    const cutoffStr = cutoff.toISOString().split('T')[0];
    return detail.observations.filter((obs) => obs.date >= cutoffStr);
  }, [detail?.observations, currentPeriod]);

  if (loading) {
    return (
      <div className="detail-page">
        <button className="detail-page__back" onClick={() => navigate('/')}>
          ← Voltar
        </button>
        <div className="loading">
          <div className="loading__spinner" />
          <span className="loading__text">Carregando detalhes...</span>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="detail-page">
        <button className="detail-page__back" onClick={() => navigate('/')}>
          ← Voltar
        </button>
        <div className="error-message">
          ❌ {error ?? 'Indicador não encontrado'}
        </div>
      </div>
    );
  }

  const variationClass = detail.variationPercent === null
    ? 'card__variation--neutral'
    : detail.variationPercent >= 0
      ? 'card__variation--positive'
      : 'card__variation--negative';

  const variationText = detail.variationPercent === null
    ? 'N/A'
    : `${detail.variationPercent >= 0 ? '+' : ''}${detail.variationPercent.toFixed(2)}%`;

  return (
    <div className="detail-page" id="detail-page">
      <button className="detail-page__back" onClick={() => navigate('/')} id="btn-back">
        ← Voltar ao Dashboard
      </button>

      <div className="detail-header">
        <div className="detail-header__info">
          <h1>{detail.name}</h1>
          <p className="detail-header__description">{detail.description}</p>
        </div>
        <div className="detail-header__stats">
          <div className="stat-block">
            <div className="stat-block__label">Último valor</div>
            <div className="stat-block__value">
              {detail.latestValue?.toLocaleString('pt-BR', { maximumFractionDigits: 4 }) ?? '—'}
              {detail.unit && <span className="card__unit"> {detail.unit}</span>}
            </div>
          </div>
          <div className="stat-block">
            <div className="stat-block__label">Variação</div>
            <div className={`stat-block__value ${variationClass}`} style={{ borderRadius: '8px', padding: '2px 8px' }}>
              {variationText}
            </div>
          </div>
          <div className="stat-block">
            <div className="stat-block__label">Data ref.</div>
            <div className="stat-block__value" style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
              {detail.latestDate
                ? new Date(detail.latestDate + 'T00:00:00').toLocaleDateString('pt-BR')
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="chart-container">
        <div className="chart-container__header">
          <span className="chart-container__title">Histórico</span>
          <div className="chart-container__period-btns">
            {periods.map((period, idx) => (
              <button
                key={period.label}
                className={`period-btn ${idx === selectedPeriod ? 'period-btn--active' : ''}`}
                onClick={() => setSelectedPeriod(idx)}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        <IndicatorChart
          observations={filteredObservations}
          unit={detail.unit}
        />
      </div>

      {/* Limitações */}
      {detail.limitations && (
        <div className="limitations">
          <strong>⚠️ Limitações dos dados:</strong> {detail.limitations}
        </div>
      )}

      {/* Tabela de dados */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {[...filteredObservations].reverse().slice(0, 50).map((obs) => (
              <tr key={obs.date}>
                <td>{new Date(obs.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td>{obs.value.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
