import { Category } from '@/types';
import React from 'react';
import styles from './EditTransactionModal.module.css';

interface TransactionFormData {
  amount: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

interface TransactionFormProps {
  formData: TransactionFormData;
  categories: Category[];
  errors: Array<{ field: string; message: string }>;
  onFieldChange: <K extends keyof TransactionFormData>(field: K, value: TransactionFormData[K]) => void;
  showTypeField?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  formData,
  categories,
  errors,
  onFieldChange,
  showTypeField = true
}) => {
  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  return (
    <>
      {showTypeField && (
        <div className={styles.formGroup}>
          <label htmlFor="type">Tipo</label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => onFieldChange('type', e.target.value as 'income' | 'expense')}
            required
          >
            <option value="expense">💸 Gasto</option>
            <option value="income">💰 Ganho</option>
          </select>
          {getFieldError('type') && (
            <span className={styles.errorMessage}>{getFieldError('type')}</span>
          )}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="amount">Valor (R$)</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) => onFieldChange('amount', e.target.value)}
          placeholder="0,00"
          required
          className={getFieldError('amount') ? styles.inputError : ''}
        />
        {getFieldError('amount') && (
          <span className={styles.errorMessage}>{getFieldError('amount')}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="date">Data e Hora</label>
        <input
          id="date"
          type="datetime-local"
          value={formData.date}
          onChange={(e) => onFieldChange('date', e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category">Categoria</label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => onFieldChange('category', e.target.value)}
          required
          className={getFieldError('category') ? styles.inputError : ''}
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
        {getFieldError('category') && (
          <span className={styles.errorMessage}>{getFieldError('category')}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Descrição</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          rows={3}
          placeholder="Ex: Almoço no restaurante"
          required
          className={getFieldError('description') ? styles.inputError : ''}
        />
        {getFieldError('description') && (
          <span className={styles.errorMessage}>{getFieldError('description')}</span>
        )}
      </div>
    </>
  );
};

