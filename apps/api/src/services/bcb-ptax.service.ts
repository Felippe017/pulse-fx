import { formatDateBCB, getDaysAgo, formatDateISO } from '../domain/date-utils';

interface PtaxCotacao {
  cotacaoCompra: number;
  cotacaoVenda: number;
  dataHoraCotacao: string;
}

interface PtaxResponse {
  value: PtaxCotacao[];
}

/**
 * Serviço de integração com a API BCB Olinda PTAX.
 * Documentação: https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3/
 */
export class BcbPtaxService {
  private baseUrl = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';

  /**
   * Busca cotações do Dólar PTAX (venda) em um período.
   */
  async fetchDollarQuotes(
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ date: string; value: number }>> {
    const start = formatDateBCB(startDate);
    const end = formatDateBCB(endDate);

    const url = `${this.baseUrl}/CotacaoDolarPeriodo(dataInicial=@di,dataFinalCotacao=@df)?` +
      `@di='${start}'&@df='${end}'&$format=json&$select=cotacaoVenda,dataHoraCotacao` +
      `&$orderby=dataHoraCotacao asc`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`BCB PTAX USD error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as PtaxResponse;
    return this.deduplicateByDate(data.value);
  }

  /**
   * Busca cotações de uma moeda (ex: EUR) via PTAX.
   */
  async fetchCurrencyQuotes(
    currency: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ date: string; value: number }>> {
    const start = formatDateBCB(startDate);
    const end = formatDateBCB(endDate);

    const url = `${this.baseUrl}/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@di,dataFinalCotacao=@df)?` +
      `@moeda='${currency}'&@di='${start}'&@df='${end}'&$format=json` +
      `&$select=cotacaoVenda,dataHoraCotacao&$orderby=dataHoraCotacao asc`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`BCB PTAX ${currency} error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as PtaxResponse;
    return this.deduplicateByDate(data.value);
  }

  /**
   * A API PTAX pode retornar múltiplas cotações por dia (abertura, fechamento, etc.).
   * Pegamos a última cotação do dia (fechamento).
   */
  private deduplicateByDate(
    cotacoes: PtaxCotacao[],
  ): Array<{ date: string; value: number }> {
    const byDate = new Map<string, number>();

    for (const c of cotacoes) {
      // dataHoraCotacao formato: "2024-01-15 13:11:32.151"
      const date = c.dataHoraCotacao.split(' ')[0];
      // Sobrescreve para manter o último (mais recente do dia = fechamento)
      byDate.set(date, c.cotacaoVenda);
    }

    return Array.from(byDate.entries()).map(([date, value]) => ({ date, value }));
  }
}

export const bcbPtaxService = new BcbPtaxService();
