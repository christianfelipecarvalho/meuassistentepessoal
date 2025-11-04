'use client';

import { Category } from '@/types';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import React, { useEffect } from 'react';
import { TransactionForm } from './TransactionForm';
import styles from './EditTransactionModal.module.css';

interface AddTransactionModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTransaction: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    date: Date;
  }) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  categories,
  isOpen,
  onClose,
  onSave
}) => {
  const { formData, errors, handleSubmit, resetForm, updateFormField } = useTransactionForm({
    onSubmit: (data) => {
      onSave(data);
      resetForm();
      onClose();
    }
  });

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>➕ Nova Transação</h2>
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
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

