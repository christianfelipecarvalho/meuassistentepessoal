import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/audioService';
import styles from './SummaryCards.module.css';

interface SummaryCardsProps {
  transactions: Transaction[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions }) => {
  const getTotalByType = (type: 'income' | 'expense'): number => {
    return transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const incomeTotal = getTotalByType('income');
  const expenseTotal = getTotalByType('expense');
  const balance = incomeTotal - expenseTotal;

  return (
    <div className={styles.summaryCards}>
      <div className={`${styles.summaryCard} ${styles.income}`}>
        <h3>💰 Ganhos</h3>
        <p className={styles.amount}>{formatCurrency(incomeTotal)}</p>
      </div>
      <div className={`${styles.summaryCard} ${styles.expense}`}>
        <h3>💸 Gastos</h3>
        <p className={styles.amount}>{formatCurrency(expenseTotal)}</p>
      </div>
      <div className={`${styles.summaryCard} ${styles.balance}`}>
        <h3>💳 Saldo</h3>
        <p className={`${styles.amount} ${balance >= 0 ? styles.positive : styles.negative}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
};
