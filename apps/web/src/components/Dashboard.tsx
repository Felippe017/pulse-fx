import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIndicators } from '../hooks/useIndicators';
import { IndicatorCard } from './IndicatorCard';

export function Dashboard() {
  const { indicators, loading, error, toggleFavorite } = useIndicators();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const navigate = useNavigate();

  const filteredIndicators = showFavoritesOnly
    ? indicators.filter((ind) => ind.isFavorite)
    : indicators;

  if (loading) {
    return (
      <>
        <Header
          showFavoritesOnly={showFavoritesOnly}
          onToggleFilter={() => setShowFavoritesOnly(!showFavoritesOnly)}
        />
        <div className="loading">
          <div className="loading__spinner" />
          <span className="loading__text">Carregando indicadores...</span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          showFavoritesOnly={showFavoritesOnly}
          onToggleFilter={() => setShowFavoritesOnly(!showFavoritesOnly)}
        />
        <div className="error-message">
          ❌ {error}
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        showFavoritesOnly={showFavoritesOnly}
        onToggleFilter={() => setShowFavoritesOnly(!showFavoritesOnly)}
      />
      <div className="dashboard-grid" id="dashboard-grid">
        {filteredIndicators.map((indicator) => (
          <IndicatorCard
            key={indicator.id}
            indicator={indicator}
            onFavoriteToggle={() => toggleFavorite(indicator.id)}
            onClick={() => navigate(`/indicator/${indicator.id}`)}
          />
        ))}
        {filteredIndicators.length === 0 && (
          <div className="error-message" style={{ gridColumn: '1 / -1' }}>
            {showFavoritesOnly
              ? 'Nenhum indicador favoritado. Clique no ⭐ para adicionar.'
              : 'Nenhum indicador disponível.'}
          </div>
        )}
      </div>
    </>
  );
}

function Header({
  showFavoritesOnly,
  onToggleFilter,
}: {
  showFavoritesOnly: boolean;
  onToggleFilter: () => void;
}) {
  return (
    <header className="header" id="header">
      <div className="header__logo">
        <div className="header__pulse-dot" />
        <div>
          <div className="header__title">Pulse FX</div>
          <div className="header__subtitle">Câmbio & Indicadores Macro</div>
        </div>
      </div>
      <div className="header__actions">
        <button
          className={`filter-btn ${!showFavoritesOnly ? 'filter-btn--active' : ''}`}
          onClick={showFavoritesOnly ? onToggleFilter : undefined}
          id="btn-all"
        >
          Todos
        </button>
        <button
          className={`filter-btn ${showFavoritesOnly ? 'filter-btn--active' : ''}`}
          onClick={!showFavoritesOnly ? onToggleFilter : undefined}
          id="btn-favorites"
        >
          ⭐ Favoritos
        </button>
      </div>
    </header>
  );
}
