import { Category, Transaction } from '@/types';
import { formatCurrency } from '@/utils';
import React from 'react';
import styles from './CategorySection.module.css';
import { TransactionItem } from './TransactionItem';

interface CategorySectionProps {
  category: Category;
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ 
  category, 
  transactions, 
  onEditTransaction, 
  onDeleteTransaction 
}) => {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  if (transactions.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.categorySection}>
      <div className={styles.categoryHeader}>
        <span className={styles.categoryIcon}>{category.icon}</span>
        <h3 className={styles.categoryName}>{category.name}</h3>
        <span className={styles.categoryTotal}>{formatCurrency(totalAmount)}</span>
      </div>
      
      <div className={styles.transactionsList}>
        {transactions.map(transaction => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction}
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
          />
        ))}
      </div>
    </div>
  );
};
