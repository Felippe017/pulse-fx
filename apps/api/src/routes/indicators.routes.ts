import { Router, Request, Response } from 'express';
import { indicatorRepository } from '../repositories/indicator.repository';
import { observationRepository } from '../repositories/observation.repository';
import { calculateVariation } from '../domain/variation';
import { getDaysAgo, getMonthsAgo, formatDateISO } from '../domain/date-utils';
import type { IndicatorWithLatest, IndicatorDetail } from '@pulse-fx/shared';

const router = Router();

/**
 * GET /api/indicators
 * Lista todos os indicadores com último valor, data e variação %.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const indicators = await indicatorRepository.findAllWithLatest();

    const result: IndicatorWithLatest[] = indicators.map((ind) => ({
      ...ind,
      variationPercent: calculateVariation(ind.latestValue, ind.previousValue),
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching indicators:', err);
    res.status(500).json({ error: 'Failed to fetch indicators' });
  }
});

/**
 * GET /api/indicators/:id
 * Detalhe de um indicador com série temporal.
 * Query params:
 *   - days: número de dias de histórico (para séries diárias, padrão 90)
 *   - months: número de meses de histórico (para séries mensais, padrão 24)
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid indicator ID' });
      return;
    }

    const indicator = await indicatorRepository.findByIdWithLatest(id);
    if (!indicator) {
      res.status(404).json({ error: 'Indicator not found' });
      return;
    }

    const now = new Date();
    let startDate: Date;

    if (indicator.frequency === 'daily') {
      const days = parseInt(req.query.days as string, 10) || 90;
      startDate = getDaysAgo(now, days);
    } else {
      const months = parseInt(req.query.months as string, 10) || 24;
      startDate = getMonthsAgo(now, months);
    }

    const observations = await observationRepository.findByIndicatorAndDateRange(
      id,
      formatDateISO(startDate),
      formatDateISO(now),
    );

    const limitations = getLimitations(indicator.source, indicator.frequency);

    const detail: IndicatorDetail = {
      ...indicator,
      variationPercent: calculateVariation(indicator.latestValue, indicator.previousValue),
      observations,
      limitations,
    };

    res.json(detail);
  } catch (err) {
    console.error('Error fetching indicator detail:', err);
    res.status(500).json({ error: 'Failed to fetch indicator detail' });
  }
});

/**
 * Texto de limitações por tipo de fonte/frequência.
 */
function getLimitations(source: string, frequency: string): string {
  const lines: string[] = [];

  if (source === 'bcb-ptax') {
    lines.push(
      'Cotações PTAX são divulgadas pelo Banco Central do Brasil em dias úteis.',
      'Em fins de semana e feriados não há cotação — o sistema exibe o último valor conhecido.',
      'A PTAX de fechamento pode ser atualizada até o final do expediente bancário.',
    );
  } else if (source === 'bcb-sgs') {
    lines.push(
      'Dados do SGS/BCB podem ter atraso de publicação de 1-2 dias úteis.',
      'Séries mensais são publicadas com defasagem variável conforme o indicador.',
    );
  } else if (source === 'fred') {
    lines.push(
      'Dados do FRED são publicados pelo Federal Reserve Bank of St. Louis.',
      'Séries mensais podem ter defasagem de 2-4 semanas após o período de referência.',
      'Valores podem ser revisados retroativamente pelo órgão emissor.',
    );
  }

  if (frequency === 'daily') {
    lines.push('Variação calculada em relação ao dia útil anterior com dado disponível.');
  } else {
    lines.push('Variação calculada em relação ao mês anterior com dado disponível.');
  }

  lines.push('Dados para fins educacionais. Não constitui recomendação de investimento.');

  return lines.join(' ');
}

export default router;
