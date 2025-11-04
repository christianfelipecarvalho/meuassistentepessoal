import { Transaction } from '@/types';
import { formatCurrency, TimeFilterType, TransactionFilterUtils } from '@/utils';
import React, { useMemo, useState } from 'react';
import { TimeFilter } from './TimeFilter';
import styles from './SummaryCards.module.css';

interface SummaryCardsProps {
  transactions: Transaction[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<TimeFilterType>('all');
  const [referenceDate, setReferenceDate] = useState(new Date());

  // Filtrar transações baseado no período selecionado
  const filteredTransactions = useMemo(() => {
    return TransactionFilterUtils.filterByPeriod(transactions, filterType, referenceDate);
  }, [transactions, filterType, referenceDate]);

  const getTotalByType = (type: 'income' | 'expense'): number => {
    return filteredTransactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const incomeTotal = getTotalByType('income');
  const expenseTotal = getTotalByType('expense');
  const balance = incomeTotal - expenseTotal;

  return (
    <div className={styles.summaryCardsContainer}>
      <TimeFilter
        filterType={filterType}
        onFilterChange={setFilterType}
        referenceDate={referenceDate}
        onDateChange={setReferenceDate}
      />
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
    </div>
  );
};
