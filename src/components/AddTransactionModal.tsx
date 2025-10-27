'use client';

import { Category } from '@/types';
import React, { useState } from 'react';
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
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().slice(0, 16) // Data/hora atual
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor válido maior que zero');
      return;
    }

    if (!formData.category || !formData.description.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    onSave({
      amount,
      type: formData.type,
      category: formData.category,
      description: formData.description.trim(),
      date: new Date(formData.date)
    });

    // Limpar formulário
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: new Date().toISOString().slice(0, 16)
    });

    onClose();
  };

  const handleClose = () => {
    // Limpar formulário ao fechar
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: new Date().toISOString().slice(0, 16)
    });
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
          <div className={styles.formGroup}>
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
              required
            >
              <option value="expense">💸 Gasto</option>
              <option value="income">💰 Ganho</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount">Valor (R$)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0,00"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date">Data e Hora</label>
            <input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">Categoria</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Ex: Almoço no restaurante"
              required
            />
          </div>

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

