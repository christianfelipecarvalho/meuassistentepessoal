import { FORMAT_CONSTANTS, VALIDATION_RULES } from '@/constants';
import { Money } from '@/domain';
import { Transaction } from '@/types';

/**
 * Barrel export para utilitários
 * Facilita importações e mantém código organizado
 */

// Re-export formatters
export { formatCurrency, formatDate, formatRelativeDate } from './formatters';

// Re-export logger
export { Logger, createLogger } from './logger';

// Import para uso interno
import { formatCurrency, formatDate, formatRelativeDate } from './formatters';

// Utility classes seguindo Single Responsibility Principle

export class ValidationUtils {
  static validateAmount(amount: number): boolean {
    return amount >= VALIDATION_RULES.MIN_AMOUNT && 
           amount <= VALIDATION_RULES.MAX_AMOUNT;
  }

  static validateDescription(description: string): boolean {
    return description.length >= VALIDATION_RULES.MIN_DESCRIPTION_LENGTH &&
           description.length <= VALIDATION_RULES.MAX_DESCRIPTION_LENGTH;
  }

  static validateCategory(category: string): boolean {
    return category.length >= VALIDATION_RULES.MIN_CATEGORY_LENGTH &&
           category.length <= VALIDATION_RULES.MAX_CATEGORY_LENGTH;
  }

  static validateTransaction(transaction: Partial<Transaction>): string[] {
    const errors: string[] = [];

    if (!transaction.amount || !this.validateAmount(transaction.amount)) {
      errors.push('Valor inválido');
    }

    if (!transaction.description || !this.validateDescription(transaction.description)) {
      errors.push('Descrição inválida');
    }

    if (!transaction.category || !this.validateCategory(transaction.category)) {
      errors.push('Categoria inválida');
    }

    if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
      errors.push('Tipo de transação inválido');
    }

    return errors;
  }
}

// FormatUtils foi movido para ./formatters.ts e exportado como funções standalone
// Mantido aqui apenas para compatibilidade com código legado
export class FormatUtils {
  /** @deprecated Use formatCurrency from '@/utils' instead */
  static formatCurrency = formatCurrency;
  /** @deprecated Use formatDate from '@/utils' instead */
  static formatDate = formatDate;
  /** @deprecated Use formatRelativeDate from '@/utils' instead */
  static formatRelativeDate = formatRelativeDate;
}

export class CalculationUtils {
  static calculateTotal(transactions: Transaction[], type: 'income' | 'expense'): Money {
    const filteredTransactions = transactions.filter(t => t.type === type);
    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    return new Money(total);
  }

  static calculateBalance(transactions: Transaction[]): Money {
    const incomeTotal = this.calculateTotal(transactions, 'income');
    const expenseTotal = this.calculateTotal(transactions, 'expense');
    return incomeTotal.subtract(expenseTotal);
  }

  static calculatePercentage(value: number, total: number): number {
    if (total === 0) {
      return 0;
    }
    return Math.round((value / total) * 100);
  }

  static groupByCategory(transactions: Transaction[]): Map<string, Transaction[]> {
    const grouped = new Map<string, Transaction[]>();
    
    transactions.forEach(transaction => {
      const category = transaction.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(transaction);
    });

    return grouped;
  }

  static getCategoryTotals(transactions: Transaction[]): Map<string, Money> {
    const grouped = this.groupByCategory(transactions);
    const totals = new Map<string, Money>();

    grouped.forEach((categoryTransactions, category) => {
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      totals.set(category, new Money(total));
    });

    return totals;
  }
}

export class ArrayUtils {
  static sortByDate<T extends { date: Date }>(items: T[], ascending: boolean = false): T[] {
    return [...items].sort((a, b) => {
      const comparison = a.date.getTime() - b.date.getTime();
      return ascending ? comparison : -comparison;
    });
  }

  static sortByAmount<T extends { amount: number }>(items: T[], ascending: boolean = false): T[] {
    return [...items].sort((a, b) => {
      const comparison = a.amount - b.amount;
      return ascending ? comparison : -comparison;
    });
  }

  static filterByDateRange<T extends { date: Date }>(
    items: T[], 
    startDate: Date, 
    endDate: Date
  ): T[] {
    return items.filter(item => 
      item.date >= startDate && item.date <= endDate
    );
  }

  static filterByCategory<T extends { category: string }>(
    items: T[], 
    category: string
  ): T[] {
    return items.filter(item => item.category === category);
  }

  static filterByType<T extends { type: string }>(
    items: T[], 
    type: string
  ): T[] {
    return items.filter(item => item.type === type);
  }
}

export class DateUtils {
  static getStartOfDay(date: Date): Date {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }

  static getEndOfDay(date: Date): Date {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  static getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  static getEndOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  static getStartOfYear(date: Date): Date {
    return new Date(date.getFullYear(), 0, 1);
  }

  static getEndOfYear(date: Date): Date {
    return new Date(date.getFullYear(), 11, 31);
  }

  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  static isThisMonth(date: Date): boolean {
    const today = new Date();
    return date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }

  static isThisYear(date: Date): boolean {
    const today = new Date();
    return date.getFullYear() === today.getFullYear();
  }
}

export class StorageUtils {
  static setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
