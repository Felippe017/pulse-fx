import { env } from '../config/env';
import { formatDateISO } from '../domain/date-utils';

interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations: FredObservation[];
}

/**
 * Serviço de integração com a API FRED (Federal Reserve Economic Data).
 * Documentação: https://fred.stlouisfed.org/docs/api/fred/
 */
export class FredService {
  private baseUrl = 'https://api.stlouisfed.org/fred';

  /**
   * Busca observações de uma série FRED.
   * @param seriesId ID da série (ex: "FEDFUNDS", "CPIAUCSL")
   */
  async fetchSeries(
    seriesId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ date: string; value: number }>> {
    const start = formatDateISO(startDate);
    const end = formatDateISO(endDate);

    const url = `${this.baseUrl}/series/observations?` +
      `series_id=${seriesId}` +
      `&api_key=${env.FRED_API_KEY}` +
      `&file_type=json` +
      `&observation_start=${start}` +
      `&observation_end=${end}` +
      `&sort_order=asc`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`FRED ${seriesId} error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as FredResponse;

    return data.observations
      .filter((obs) => obs.value !== '.' && obs.value !== '')
      .map((obs) => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }));
  }
}

export const fredService = new FredService();
