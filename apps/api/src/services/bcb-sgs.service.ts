import { formatDateSGS } from '../domain/date-utils';

interface SgsObservation {
  data: string;    // "dd/MM/yyyy"
  valor: string;   // "13.65"
}

/**
 * Serviço de integração com a API BCB SGS (Sistema Gerenciador de Séries Temporais).
 * Documentação: https://dadosabertos.bcb.gov.br/
 * Endpoint: https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados
 */
export class BcbSgsService {
  private baseUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';

  /**
   * Busca observações de uma série SGS em um período.
   * @param seriesCode Código da série (ex: "432" para Selic, "13522" para IPCA 12m)
   */
  async fetchSeries(
    seriesCode: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ date: string; value: number }>> {
    const start = formatDateSGS(startDate);
    const end = formatDateSGS(endDate);

    const url = `${this.baseUrl}.${seriesCode}/dados?formato=json&dataInicial=${start}&dataFinal=${end}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`BCB SGS ${seriesCode} error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as SgsObservation[];

    return data
      .filter((obs) => obs.valor !== null && obs.valor !== '')
      .map((obs) => ({
        date: this.parseDate(obs.data),
        value: parseFloat(obs.valor),
      }));
  }

  /**
   * Converte data do formato BCB "dd/MM/yyyy" para "YYYY-MM-DD".
   */
  private parseDate(dateStr: string): string {
    const [dd, mm, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }
}

export const bcbSgsService = new BcbSgsService();
