'use client';

import { AdBanner } from '@/components/AdBanner';
import { Transaction } from '@/types';
import { formatCurrency, TimeFilterType, TransactionFilterUtils } from '@/utils';
import { PDFExportService } from '@/utils/pdfExport';
import { XLSXExportService } from '@/utils/xlsxExport';
import React, { useMemo, useState, useRef } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { InfoTooltip } from './InfoTooltip';
import { TimeFilter } from './TimeFilter';
import styles from './Reports.module.css';

interface ReportsProps {
  transactions: Transaction[];
  userName?: string;
  userEmail?: string;
  canShowAds?: boolean;
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
  '#ef4444', // Vermelho (para gastos)
  '#06b6d4', // Ciano
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Laranja
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#6366f1', // Indigo
  '#6b7280', // Cinza
];

// Cores para ganhos (sem vermelho)
const INCOME_COLORS = [
  '#10b981', // Verde
  '#3b82f6', // Azul
  '#06b6d4', // Ciano
  '#8b5cf6', // Roxo
  '#6366f1', // Indigo
  '#f59e0b', // Laranja
  '#ec4899', // Rosa
  '#14b8a6', // Teal
  '#0ea5e9', // Sky Blue
  '#6b7280', // Cinza
];

export const Reports: React.FC<ReportsProps> = ({ transactions, userName, userEmail, canShowAds = true }) => {
  // Estado para controlar o filtro de tempo
  const [filterType, setFilterType] = useState<TimeFilterType>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);
  const reportsContainerRef = useRef<HTMLDivElement>(null);

  // Calcular dados do período selecionado
  const filteredData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    return TransactionFilterUtils.filterByPeriod(transactions, filterType, selectedDate);
  }, [transactions, filterType, selectedDate]);

  // Calcular totais
  const totals = useMemo(() => {
    const income = filteredData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expense,
      balance: income - expense,
      total: income + expense
    };
  }, [filteredData]);

  // Dados para gráfico de pizza - Gastos por categoria
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    filteredData
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
  }, [filteredData]);

  // Dados para gráfico de pizza - Ganhos por categoria
  const incomeByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    filteredData
      .filter(t => t.type === 'income')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    const data: CategoryData[] = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: INCOME_COLORS[index % INCOME_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    return data;
  }, [filteredData]);

  // Calcular percentuais
  const getPercentage = (value: number, total: number): string => {
    if (total === 0) {
      return '0%';
    }
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // Custom label para o gráfico de pizza - Gastos
  const renderExpenseLabel = (entry: any) => {
    if (!entry.value || totals.expense === 0) {
      return '';
    }
    const percent = (entry.value / totals.expense) * 100;
    return `${percent.toFixed(0)}%`;
  };

  // Custom label para o gráfico de pizza - Ganhos
  const renderIncomeLabel = (entry: any) => {
    if (!entry.value || totals.income === 0) {
      return '';
    }
    const percent = (entry.value / totals.income) * 100;
    return `${percent.toFixed(0)}%`;
  };

  const handleExportPDF = async () => {
    if (!reportsContainerRef.current) {
      return;
    }

    setIsExporting(true);
    
    try {
      // Buscar gráficos container se existir
      const chartsContainer = reportsContainerRef.current.querySelector(`.${styles.chartsGrid}`) as HTMLElement;
      
      if (chartsContainer) {
        await PDFExportService.exportReportWithCharts({
          transactions,
          filterType,
          selectedDate,
          totals,
          expensesByCategory,
          incomeByCategory,
          userName,
          userEmail,
          chartsContainer
        });
      } else {
        await PDFExportService.exportReport({
          transactions,
          filterType,
          selectedDate,
          totals,
          expensesByCategory,
          incomeByCategory,
          userName,
          userEmail
        });
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXLSX = async () => {
    if (filteredData.length === 0) {
      return;
    }

    setIsExportingXLSX(true);
    
    try {
      await XLSXExportService.exportReport({
        transactions,
        filterType,
        selectedDate,
        totals,
        expensesByCategory,
        incomeByCategory,
        userName,
        userEmail
      });
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      alert('Erro ao exportar XLSX. Tente novamente.');
    } finally {
      setIsExportingXLSX(false);
    }
  };

  return (
    <div className={styles.reportsContainer} ref={reportsContainerRef}>
      <div className={styles.headerWithExport}>
        <h2 className={styles.title}>Relatório Financeiro</h2>
        <div className={styles.exportButtons}>
          <button
            className={`${styles.exportButton} ${styles.exportButtonXLSX}`}
            onClick={handleExportXLSX}
            disabled={isExportingXLSX || filteredData.length === 0}
            aria-label="Exportar relatório como Excel"
            title="Exportar Excel"
          >
            {isExportingXLSX ? (
              <>
                <span className={styles.exportIcon}>⏳</span>
                <span className={styles.exportText}>Exportando...</span>
              </>
            ) : (
              <>
                <span className={styles.exportIcon}>📊</span>
                <span className={styles.exportText}>Exportar Excel</span>
              </>
            )}
          </button>
          <button
            className={styles.exportButton}
            onClick={handleExportPDF}
            disabled={isExporting || filteredData.length === 0}
            aria-label="Exportar relatório como PDF"
            title="Exportar PDF"
          >
            {isExporting ? (
              <>
                <span className={styles.exportIcon}>⏳</span>
                <span className={styles.exportText}>Exportando...</span>
              </>
            ) : (
              <>
                <span className={styles.exportIcon}>📄</span>
                <span className={styles.exportText}>Exportar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Filtro de Tempo */}
      <TimeFilter
        filterType={filterType}
        onFilterChange={setFilterType}
        referenceDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Resumo Geral */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.income}`}>
          <div className={styles.cardIcon}>💰</div>
          <div className={styles.cardContent}>
            <h3>Total de Ganhos</h3>
            <p className={styles.cardAmount}>{formatCurrency(totals.income)}</p>
            <span className={styles.cardDetail}>
              {filteredData.filter(t => t.type === 'income').length} transações
            </span>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.expense}`}>
          <div className={styles.cardIcon}>💸</div>
          <div className={styles.cardContent}>
            <h3>Total de Gastos</h3>
            <p className={styles.cardAmount}>{formatCurrency(totals.expense)}</p>
            <span className={styles.cardDetail}>
              {filteredData.filter(t => t.type === 'expense').length} transações
            </span>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.balance} ${totals.balance >= 0 ? styles.positive : styles.negative}`}>
          <div className={styles.cardIcon}>{totals.balance >= 0 ? '📈' : '📉'}</div>
          <div className={styles.cardContent}>
            <h3>Saldo do Mês</h3>
            <p className={`${styles.cardAmount} ${totals.balance >= 0 ? styles.positiveAmount : styles.negativeAmount}`}>
              {formatCurrency(totals.balance)}
            </p>
            <span className={styles.cardDetail}>
              {totals.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {filteredData.length > 0 ? (
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
                    label={renderExpenseLabel}
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
                    label={renderIncomeLabel}
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
      {filteredData.length > 0 && (
        <div className={styles.analysisCard}>
          <h3 className={styles.analysisTitle}>📈 Análise Financeira</h3>
          <div className={styles.analysisList}>
            <div className={styles.analysisItem}>
              <div className={styles.analysisLabelContainer}>
                <span className={styles.analysisLabel}>Ticket Médio (Gastos):</span>
                <InfoTooltip
                  title="Ticket Médio (Gastos)"
                  content="O ticket médio de gastos é o valor médio gasto por transação. É calculado dividindo o total de gastos pelo número de transações de gastos realizadas no período."
                />
              </div>
              <span className={styles.analysisValue}>
                {formatCurrency(
                  (() => {
                    const expenses = filteredData.filter(t => t.type === 'expense');
                    return expenses.length > 0 ? totals.expense / expenses.length : 0;
                  })()
                )}
              </span>
            </div>
            <div className={styles.analysisItem}>
              <div className={styles.analysisLabelContainer}>
                <span className={styles.analysisLabel}>Ticket Médio (Ganhos):</span>
                <InfoTooltip
                  title="Ticket Médio (Ganhos)"
                  content="O ticket médio de ganhos é o valor médio recebido por transação. É calculado dividindo o total de ganhos pelo número de transações de ganhos realizadas no período."
                />
              </div>
              <span className={styles.analysisValue}>
                {formatCurrency(
                  (() => {
                    const incomes = filteredData.filter(t => t.type === 'income');
                    return incomes.length > 0 ? totals.income / incomes.length : 0;
                  })()
                )}
              </span>
            </div>
            <div className={styles.analysisItem}>
              <div className={styles.analysisLabelContainer}>
                <span className={styles.analysisLabel}>Taxa de Poupança:</span>
                <InfoTooltip
                  title="Taxa de Poupança"
                  content="A taxa de poupança mostra quanto você está conseguindo poupar em relação aos seus ganhos. É calculada dividindo o saldo (ganhos - gastos) pelo total de ganhos e multiplicando por 100. Um valor positivo indica que você está gastando menos do que ganha."
                />
              </div>
              <span className={`${styles.analysisValue} ${totals.balance >= 0 ? styles.positive : styles.negative}`}>
                {totals.income > 0 ? getPercentage(totals.balance, totals.income) : '0%'}
              </span>
            </div>
            <div className={styles.analysisItem}>
              <span className={styles.analysisLabel}>Maior Gasto:</span>
              <span className={styles.analysisValue}>
                {formatCurrency(
                  (() => {
                    const expenses = filteredData.filter(t => t.type === 'expense');
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
                    const incomes = filteredData.filter(t => t.type === 'income');
                    return incomes.length > 0 ? Math.max(...incomes.map(t => t.amount)) : 0;
                  })()
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Anúncio in-article no final dos relatórios */}
      {canShowAds && filteredData.length > 0 && (
        <AdBanner 
          adSlot="7875119612" 
          adLayout="in-article" 
          compact 
        />
      )}
    </div>
  );
};

