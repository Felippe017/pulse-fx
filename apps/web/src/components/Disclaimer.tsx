import React from 'react';

export function Disclaimer() {
  return (
    <div className="disclaimer" id="disclaimer">
      <span className="disclaimer__icon">⚠️</span>
      <strong>Aviso legal:</strong> As informações exibidas no Pulse FX têm caráter
      exclusivamente <strong>educacional e informativo</strong>. Os dados são obtidos de fontes
      públicas (BCB, FRED) e podem apresentar atrasos ou imprecisões. Este produto{' '}
      <strong>não constitui recomendação de investimento</strong>, consultoria financeira
      ou qualquer forma de aconselhamento para tomada de decisão financeira.
    </div>
  );
}
