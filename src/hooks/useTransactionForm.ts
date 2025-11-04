import { useState, useCallback } from 'react';
import { Transaction } from '@/types';
import { ValidationUtils } from '@/utils';

interface TransactionFormData {
  amount: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

interface UseTransactionFormProps {
  initialTransaction?: Transaction | null;
  onSubmit: (data: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    date: Date;
  }) => void;
}

interface ValidationError {
  field: string;
  message: string;
}

export const useTransactionForm = ({ initialTransaction, onSubmit }: UseTransactionFormProps) => {
  const getInitialFormData = (): TransactionFormData => {
    if (initialTransaction) {
      const dateObj = new Date(initialTransaction.date);
      const dateString = dateObj.toISOString().slice(0, 16);
      
      return {
        amount: initialTransaction.amount.toString(),
        type: initialTransaction.type,
        category: initialTransaction.category,
        description: initialTransaction.description,
        date: dateString
      };
    }
    
    return {
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: new Date().toISOString().slice(0, 16)
    };
  };

  const [formData, setFormData] = useState<TransactionFormData>(getInitialFormData());
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationError[] = [];
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.push({
        field: 'amount',
        message: 'Por favor, insira um valor válido maior que zero'
      });
    }

    if (!ValidationUtils.validateAmount(amount)) {
      newErrors.push({
        field: 'amount',
        message: 'Valor fora do intervalo permitido'
      });
    }

    if (!formData.category.trim()) {
      newErrors.push({
        field: 'category',
        message: 'Por favor, selecione uma categoria'
      });
    }

    if (!formData.description.trim()) {
      newErrors.push({
        field: 'description',
        message: 'Por favor, preencha a descrição'
      });
    }

    if (!ValidationUtils.validateDescription(formData.description.trim())) {
      newErrors.push({
        field: 'description',
        message: 'Descrição deve ter entre 3 e 200 caracteres'
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const amount = parseFloat(formData.amount);
    onSubmit({
      amount,
      type: formData.type,
      category: formData.category.trim(),
      description: formData.description.trim(),
      date: new Date(formData.date)
    });
  }, [formData, validateForm, onSubmit]);

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors([]);
  }, []);

  const updateFormField = useCallback(<K extends keyof TransactionFormData>(
    field: K,
    value: TransactionFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando atualizado
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  return {
    formData,
    errors,
    handleSubmit,
    resetForm,
    updateFormField,
    validateForm
  };
};

