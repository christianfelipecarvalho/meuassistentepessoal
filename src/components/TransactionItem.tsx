import { formatCurrency, formatDate } from '@/lib/audioService';
import { Transaction } from '@/types';
import React, { useState } from 'react';
import styles from './TransactionItem.module.css';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  onEdit, 
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleEdit = () => {
    onEdit(transaction);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      onDelete(transaction.id!);
    }
  };

  return (
    <div 
      className={`${styles.transactionItem} ${styles[transaction.type]}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={styles.transactionInfo}>
        <p className={styles.transactionDescription}>{transaction.description}</p>
        <p className={styles.transactionDate}>{formatDate(transaction.date)}</p>
      </div>
      
      <div className={styles.transactionAmount}>
        <span className={`${styles.amount} ${styles[transaction.type]}`}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>
      </div>

      <div className={`${styles.actions} ${showActions ? styles.show : ''}`}>
        <button 
          className={styles.editButton}
          onClick={handleEdit}
          title="Editar transação"
        >
          ✏️
        </button>
        <button 
          className={styles.deleteButton}
          onClick={handleDelete}
          title="Excluir transação"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
