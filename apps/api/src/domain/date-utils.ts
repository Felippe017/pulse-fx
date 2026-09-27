/**
 * Utilitários de data para o Pulse FX.
 * Tratamento de fins de semana e feriados para séries financeiras.
 */

/**
 * Verifica se uma data cai em dia de semana (seg-sex).
 */
export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

/**
 * Retorna o dia útil anterior a uma data.
 * Pula sábados e domingos.
 * Não considera feriados — em séries financeiras, quando não há dado
 * em feriado, simplesmente usamos o último dado conhecido (carry forward).
 */
export function getPreviousBusinessDay(date: Date): Date {
  const result = new Date(date);
  do {
    result.setDate(result.getDate() - 1);
  } while (!isWeekday(result));
  return result;
}

/**
 * Retorna a data de N meses atrás.
 */
export function getMonthsAgo(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

/**
 * Formata Date para string 'YYYY-MM-DD'.
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formata Date para string 'MM-dd-yyyy' (formato BCB Olinda).
 */
export function formatDateBCB(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

/**
 * Formata Date para string 'dd/MM/yyyy' (formato BCB SGS).
 */
export function formatDateSGS(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Retorna a data de N dias atrás.
 */
export function getDaysAgo(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}
