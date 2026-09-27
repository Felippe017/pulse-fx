/**
 * Calcula a variação percentual entre dois valores.
 *
 * Fórmula: ((current - previous) / |previous|) * 100
 *
 * @returns variação % com 4 casas decimais, ou null se previous for nulo/zero
 */
export function calculateVariation(
  current: number | null,
  previous: number | null,
): number | null {
  if (current === null || previous === null || previous === 0) {
    return null;
  }

  const variation = ((current - previous) / Math.abs(previous)) * 100;
  return Math.round(variation * 10000) / 10000;
}

/**
 * Formata variação para exibição (ex.: "+1.23%" ou "-0.45%")
 */
export function formatVariation(variation: number | null): string {
  if (variation === null) return 'N/A';
  const sign = variation >= 0 ? '+' : '';
  return `${sign}${variation.toFixed(2)}%`;
}
