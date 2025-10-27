'use client';

import { Transaction } from '@/types';
import { formatCurrency } from '@/utils';
import React, { useMemo } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import styles from './Reports.module.css';

interface ReportsProps {
  transactions: Transaction[];
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: any; // Index signature para Recharts
}

interface MonthlyData {
  month: string;
  ganhos: number;
  gastos: number;
}

const COLORS = [
  '#ef4444', // Vermelho
  '#06b6d4', // Ciano
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Laranja
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#6366f1', // Indigo
  '#6b7280', // Cinza
];

export const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  // Estado para controlar o mês selecionado
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  // Calcular dados do mês selecionado
  const currentMonthData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === selectedMonth &&
        transactionDate.getFullYear() === selectedYear
      );
    });
  }, [transactions, selectedDate]);

  // Navegar para o mês anterior
  const handlePreviousMonth = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navegar para o próximo mês
  const handleNextMonth = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Verificar se é o mês atual
  const isCurrentMonth = () => {
    const now = new Date();
    return selectedDate.getMonth() === now.getMonth() && 
           selectedDate.getFullYear() === now.getFullYear();
  };

  // Calcular totais
  const totals = useMemo(() => {
    const income = currentMonthData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = currentMonthData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expense,
      balance: income - expense,
      total: income + expense
    };
  }, [currentMonthData]);

  // Dados para gráfico de pizza - Gastos por categoria
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    currentMonthData
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    const data: CategoryData[] = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    return data;
  }, [currentMonthData]);

  // Dados para gráfico de pizza - Ganhos por categoria
  const incomeByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    currentMonthData
      .filter(t => t.type === 'income')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    const data: CategoryData[] = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    return data;
  }, [currentMonthData]);

  // Calcular percentuais
  const getPercentage = (value: number, total: number): string => {
    if (total === 0) {
      return '0%';
    }
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Custom label para o gráfico de pizza
  const renderLabel = (entry: any) => {
    if (!entry.value) {
      return '';
    }
    const percent = entry.percent || 0;
    return `${percent.toFixed(0)}%`;
  };

  const currentMonthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.reportsContainer}>
      <h2 className={styles.title}>📊 Relatório Financeiro</h2>
      
      {/* Navegação de Mês */}
      <div className={styles.monthNavigation}>
        <button 
          className={styles.monthButton} 
          onClick={handlePreviousMonth}
          title="Mês anterior"
        >
          ◀
        </button>
        <p className={styles.subtitle}>{currentMonthName}</p>
        <button 
          className={styles.monthButton} 
          onClick={handleNextMonth}
          disabled={isCurrentMonth()}
          title="Próximo mês"
        >
          ▶
        </button>
      </div>

      {/* Resumo Geral */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.income}`}>
          <div className={styles.cardIcon}>💰</div>
          <div className={styles.cardContent}>
            <h3>Total de Ganhos</h3>
            <p className={styles.cardAmount}>{formatCurrency(totals.income)}</p>
            <span className={styles.cardDetail}>
              {currentMonthData.filter(t => t.type === 'income').length} transações
            </span>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.expense}`}>
          <div className={styles.cardIcon}>💸</div>
          <div className={styles.cardContent}>
            <h3>Total de Gastos</h3>
            <p className={styles.cardAmount}>{formatCurrency(totals.expense)}</p>
            <span className={styles.cardDetail}>
              {currentMonthData.filter(t => t.type === 'expense').length} transações
            </span>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.balance} ${totals.balance >= 0 ? styles.positive : styles.negative}`}>
          <div className={styles.cardIcon}>{totals.balance >= 0 ? '📈' : '📉'}</div>
          <div className={styles.cardContent}>
            <h3>Saldo do Mês</h3>
            <p className={styles.cardAmount}>{formatCurrency(totals.balance)}</p>
            <span className={styles.cardDetail}>
              {totals.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {currentMonthData.length > 0 ? (
        <div className={styles.chartsGrid}>
          {/* Gráfico de Gastos */}
          {expensesByCategory.length > 0 && (
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>💸 Gastos por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* Lista de categorias */}
              <div className={styles.categoryList}>
                {expensesByCategory.map((category, index) => (
                  <div key={index} className={styles.categoryItem}>
                    <div className={styles.categoryInfo}>
                      <span 
                        className={styles.categoryDot} 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className={styles.categoryName}>{category.name}</span>
                    </div>
                    <div className={styles.categoryValues}>
                      <span className={styles.categoryAmount}>
                        {formatCurrency(category.value)}
                      </span>
                      <span className={styles.categoryPercent}>
                        {getPercentage(category.value, totals.expense)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gráfico de Ganhos */}
          {incomeByCategory.length > 0 && (
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>💰 Ganhos por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* Lista de categorias */}
              <div className={styles.categoryList}>
                {incomeByCategory.map((category, index) => (
                  <div key={index} className={styles.categoryItem}>
                    <div className={styles.categoryInfo}>
                      <span 
                        className={styles.categoryDot} 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className={styles.categoryName}>{category.name}</span>
                    </div>
                    <div className={styles.categoryValues}>
                      <span className={styles.categoryAmount}>
                        {formatCurrency(category.value)}
                      </span>
                      <span className={styles.categoryPercent}>
                        {getPercentage(category.value, totals.income)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>📊</p>
          <h3>Nenhuma transação este mês</h3>
          <p>Comece a registrar suas transações para ver os relatórios!</p>
        </div>
      )}

      {/* Análise Financeira */}
      {currentMonthData.length > 0 && (
        <div className={styles.analysisCard}>
          <h3 className={styles.analysisTitle}>📈 Análise Financeira</h3>
          <div className={styles.analysisList}>
            <div className={styles.analysisItem}>
              <span className={styles.analysisLabel}>Ticket Médio (Gastos):</span>
              <span className={styles.analysisValue}>
                {formatCurrency(
                  (() => {
                    const expenses = currentMonthData.filter(t => t.type === 'expense');
                    return expenses.length > 0 ? totals.expense / expenses.length : 0;
                  })()
                )}
              </span>
            </div>
            <div className={styles.analysisItem}>
              <span className={styles.analysisLabel}>Ticket Médio (Ganhos):</span>
              <span className={styles.analysisValue}>
                {formatCurrency(
                  (() => {
                    const incomes = currentMonthData.filter(t => t.type === 'income');
                    return incomes.length > 0 ? totals.income / incomes.length : 0;
                  })()
                )}
              </span>
            </div>
            <div className={styles.analysisItem}>
              <span className={styles.analysisLabel}>Taxa de Poupança:</span>
              <span className={`${styles.analysisValue} ${totals.balance >= 0 ? styles.positive : styles.negative}`}>
                {totals.income > 0 ? getPercentage(totals.balance, totals.income) : '0%'}
              </span>
            </div>
            <div className={styles.analysisItem}>
              <span className={styles.analysisLabel}>Maior Gasto:</span>
              <span className={styles.analysisValue}>
                {formatCurrency(
                  (() => {
                    const expenses = currentMonthData.filter(t => t.type === 'expense');
                    return expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0;
                  })()
                )}
              </span>
            </div>
            <div className={styles.analysisItem}>
              <span className={styles.analysisLabel}>Maior Ganho:</span>
              <span className={styles.analysisValue}>
                {formatCurrency(
                  (() => {
                    const incomes = currentMonthData.filter(t => t.type === 'income');
                    return incomes.length > 0 ? Math.max(...incomes.map(t => t.amount)) : 0;
                  })()
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

