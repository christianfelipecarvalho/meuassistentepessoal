import { Category, Transaction } from '@/types';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import React from 'react';
import { TransactionForm } from './TransactionForm';
import styles from './EditTransactionModal.module.css';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTransaction: Omit<Transaction, 'id'>) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  categories,
  isOpen,
  onClose,
  onSave
}) => {
  const { formData, errors, handleSubmit, updateFormField } = useTransactionForm({
    initialTransaction: transaction,
    onSubmit: (data) => {
      onSave({
        ...data,
        audioBlob: transaction?.audioBlob
      });
      onClose();
    }
  });

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !transaction) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Editar Transação</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <TransactionForm
            formData={formData}
            categories={categories}
            errors={errors}
            onFieldChange={updateFormField}
            showTypeField={true}
          />

          <div className={styles.buttons}>
            <button type="button" className={styles.cancelButton} onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveButton}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
