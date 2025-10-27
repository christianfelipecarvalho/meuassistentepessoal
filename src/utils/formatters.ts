import { FORMAT_CONSTANTS } from '@/constants';

/**
 * Utilitários para formatação de dados
 * Seguindo Single Responsibility Principle
 */

/**
 * Formata um valor numérico para o formato de moeda brasileira
 * @param amount - Valor a ser formatado
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(FORMAT_CONSTANTS.CURRENCY_LOCALE, {
    style: 'currency',
    currency: FORMAT_CONSTANTS.CURRENCY_CODE
  }).format(amount);
};

/**
 * Formata uma data para o padrão brasileiro
 * @param date - Data a ser formatada
 * @param format - Formato desejado ('short' | 'long' | 'time')
 * @returns String formatada
 */
export const formatDate = (date: Date, format: 'short' | 'long' | 'time' = 'long'): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };

  if (format === 'long') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  } else if (format === 'time') {
    options.hour = '2-digit';
    options.minute = '2-digit';
    delete options.day;
    delete options.month;
    delete options.year;
  }

  return new Intl.DateTimeFormat(FORMAT_CONSTANTS.DATE_LOCALE, options).format(date);
};

/**
 * Formata uma data de forma relativa (ex: "5 min atrás", "hoje", etc)
 * @param date - Data a ser formatada
 * @returns String formatada de forma relativa
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Agora mesmo';
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`;
  }
  if (diffInHours < 24) {
    return `${diffInHours}h atrás`;
  }
  if (diffInDays < 7) {
    return `${diffInDays} dias atrás`;
  }
  
  return formatDate(date, 'short');
};

