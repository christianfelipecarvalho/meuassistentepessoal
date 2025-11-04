import * as XLSX from 'xlsx';
import { Transaction } from '@/types';
import { formatCurrency, TimeFilterType, TransactionFilterUtils } from '@/utils';

interface ExportXLSXOptions {
  transactions: Transaction[];
  filterType: TimeFilterType;
  selectedDate: Date;
  totals: {
    income: number;
    expense: number;
    balance: number;
  };
  expensesByCategory: Array<{ name: string; value: number; color: string }>;
  incomeByCategory: Array<{ name: string; value: number; color: string }>;
  userName?: string;
  userEmail?: string;
}

export class XLSXExportService {
  // Função para remover emojis e caracteres especiais problemáticos
  private static removeEmojis(text: string): string {
    if (!text) {
      return text;
    }
    return text
      .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]/g, '') // Emojis e símbolos
      .replace(/[\u2600-\u26FF]/g, '') // Símbolos diversos
      .replace(/[\u2700-\u27BF]/g, '') // Dingbats
      .replace(/[\uFE00-\uFE0F]/g, '') // Variantes
      .replace(/[\u200D]/g, '') // Zero Width Joiner
      .replace(/[\u200B]/g, '') // Zero Width Space
      .replace(/[\uFEFF]/g, '') // Zero Width No-Break Space
      .trim();
  }

  static async exportReport(options: ExportXLSXOptions): Promise<void> {
    const {
      transactions,
      filterType,
      selectedDate,
      totals,
      expensesByCategory,
      incomeByCategory,
      userName,
      userEmail
    } = options;

    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Filtrar transações pelo período
    const filteredTransactions = TransactionFilterUtils.filterByPeriod(
      transactions,
      filterType,
      selectedDate
    );

    // ========== ABA 1: RESUMO ==========
    const summaryData = [
      ['Relatório Financeiro', '', '', ''],
      ['', '', '', ''],
      ['Período:', TransactionFilterUtils.getPeriodLabel(filterType, selectedDate), '', ''],
      ['', '', '', ''],
      ...(userName || userEmail ? [
        ['Informações do Usuário', '', '', ''],
        ...(userName ? [['Nome:', this.removeEmojis(userName), '', '']] : []),
        ...(userEmail ? [['Email:', userEmail, '', '']] : []),
        ['', '', '', ''],
      ] : []),
      ['Gerado em:', new Date().toLocaleString('pt-BR'), '', ''],
      ['', '', '', ''],
      ['Resumo Geral', '', '', ''],
      ['', '', '', ''],
      ['Item', 'Descrição', 'Valor', ''],
      ['Ganhos', 'Total de ganhos no período', totals.income, ''],
      ['Gastos', 'Total de gastos no período', totals.expense, ''],
      ['Saldo', totals.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo', totals.balance, ''],
      ['', '', '', ''],
      ['Total de Transações', `${filteredTransactions.length} transações`, '', ''],
      ['Ganhos', `${filteredTransactions.filter(t => t.type === 'income').length} transações`, '', ''],
      ['Gastos', `${filteredTransactions.filter(t => t.type === 'expense').length} transações`, '', ''],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Ajustar largura das colunas
    summarySheet['!cols'] = [
      { wch: 20 }, // Coluna A
      { wch: 40 }, // Coluna B
      { wch: 20 }, // Coluna C
      { wch: 10 }, // Coluna D
    ];

    // Formatar células de valores monetários
    const formatCurrencyCell = (row: number, col: number) => {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!summarySheet[cellRef]) {
        return;
      }
      
      summarySheet[cellRef].t = 'n'; // Tipo numérico
      summarySheet[cellRef].z = '"R$"#,##0.00'; // Formato de moeda brasileira
    };

    // Aplicar formato de moeda nas células de valores
    formatCurrencyCell(11, 2); // Ganhos
    formatCurrencyCell(12, 2); // Gastos
    formatCurrencyCell(13, 2); // Saldo

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // ========== ABA 2: GASTOS DETALHADOS ==========
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (expenses.length > 0) {
      const expensesData = [
        ['Gastos Detalhados', '', '', ''],
        ['', '', '', ''],
        ['Data', 'Categoria', 'Descrição', 'Valor'],
        ...expenses.map(transaction => [
          new Date(transaction.date).toLocaleDateString('pt-BR'),
          this.removeEmojis(transaction.category),
          this.removeEmojis(transaction.description),
          transaction.amount,
        ]),
        ['', '', '', ''],
        ['Total de Gastos', '', '', totals.expense],
      ];

      const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
      
      expensesSheet['!cols'] = [
        { wch: 12 }, // Data
        { wch: 25 }, // Categoria
        { wch: 40 }, // Descrição
        { wch: 18 }, // Valor
      ];

      // Formatar valores monetários
      expenses.forEach((_, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: index + 3, c: 3 });
        if (expensesSheet[cellRef]) {
          expensesSheet[cellRef].t = 'n';
          expensesSheet[cellRef].z = '"R$"#,##0.00';
        }
      });

      // Formatar total
      const totalCellRef = XLSX.utils.encode_cell({ r: expenses.length + 4, c: 3 });
      if (expensesSheet[totalCellRef]) {
        expensesSheet[totalCellRef].t = 'n';
        expensesSheet[totalCellRef].z = '"R$"#,##0.00';
        expensesSheet[totalCellRef].s = { font: { bold: true } };
      }

      XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Gastos');
    }

    // ========== ABA 3: GANHOS DETALHADOS ==========
    const incomes = filteredTransactions
      .filter(t => t.type === 'income')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (incomes.length > 0) {
      const incomesData = [
        ['Ganhos Detalhados', '', '', ''],
        ['', '', '', ''],
        ['Data', 'Categoria', 'Descrição', 'Valor'],
        ...incomes.map(transaction => [
          new Date(transaction.date).toLocaleDateString('pt-BR'),
          this.removeEmojis(transaction.category),
          this.removeEmojis(transaction.description),
          transaction.amount,
        ]),
        ['', '', '', ''],
        ['Total de Ganhos', '', '', totals.income],
      ];

      const incomesSheet = XLSX.utils.aoa_to_sheet(incomesData);
      
      incomesSheet['!cols'] = [
        { wch: 12 }, // Data
        { wch: 25 }, // Categoria
        { wch: 40 }, // Descrição
        { wch: 18 }, // Valor
      ];

      // Formatar valores monetários
      incomes.forEach((_, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: index + 3, c: 3 });
        if (incomesSheet[cellRef]) {
          incomesSheet[cellRef].t = 'n';
          incomesSheet[cellRef].z = '"R$"#,##0.00';
        }
      });

      // Formatar total
      const totalCellRef = XLSX.utils.encode_cell({ r: incomes.length + 4, c: 3 });
      if (incomesSheet[totalCellRef]) {
        incomesSheet[totalCellRef].t = 'n';
        incomesSheet[totalCellRef].z = '"R$"#,##0.00';
        incomesSheet[totalCellRef].s = { font: { bold: true } };
      }

      XLSX.utils.book_append_sheet(workbook, incomesSheet, 'Ganhos');
    }

    // ========== ABA 4: GASTOS POR CATEGORIA ==========
    if (expensesByCategory.length > 0) {
      const expensesByCatData = [
        ['Gastos por Categoria', '', '', ''],
        ['', '', '', ''],
        ['Categoria', 'Valor', 'Percentual', ''],
        ...expensesByCategory.map(category => [
          this.removeEmojis(category.name),
          category.value,
          totals.expense > 0 ? ((category.value / totals.expense) * 100).toFixed(2) + '%' : '0%',
          '',
        ]),
        ['', '', '', ''],
        ['Total', totals.expense, '100%', ''],
      ];

      const expensesByCatSheet = XLSX.utils.aoa_to_sheet(expensesByCatData);
      
      expensesByCatSheet['!cols'] = [
        { wch: 30 }, // Categoria
        { wch: 18 }, // Valor
        { wch: 12 }, // Percentual
        { wch: 10 }, // Vazio
      ];

      // Formatar valores monetários
      expensesByCategory.forEach((_, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: index + 3, c: 1 });
        if (expensesByCatSheet[cellRef]) {
          expensesByCatSheet[cellRef].t = 'n';
          expensesByCatSheet[cellRef].z = '"R$"#,##0.00';
        }
      });

      // Formatar total
      const totalCellRef = XLSX.utils.encode_cell({ r: expensesByCategory.length + 5, c: 1 });
      if (expensesByCatSheet[totalCellRef]) {
        expensesByCatSheet[totalCellRef].t = 'n';
        expensesByCatSheet[totalCellRef].z = '"R$"#,##0.00';
        expensesByCatSheet[totalCellRef].s = { font: { bold: true } };
      }

      XLSX.utils.book_append_sheet(workbook, expensesByCatSheet, 'Categorias - Gastos');
    }

    // ========== ABA 5: GANHOS POR CATEGORIA ==========
    if (incomeByCategory.length > 0) {
      const incomeByCatData = [
        ['Ganhos por Categoria', '', '', ''],
        ['', '', '', ''],
        ['Categoria', 'Valor', 'Percentual', ''],
        ...incomeByCategory.map(category => [
          this.removeEmojis(category.name),
          category.value,
          totals.income > 0 ? ((category.value / totals.income) * 100).toFixed(2) + '%' : '0%',
          '',
        ]),
        ['', '', '', ''],
        ['Total', totals.income, '100%', ''],
      ];

      const incomeByCatSheet = XLSX.utils.aoa_to_sheet(incomeByCatData);
      
      incomeByCatSheet['!cols'] = [
        { wch: 30 }, // Categoria
        { wch: 18 }, // Valor
        { wch: 12 }, // Percentual
        { wch: 10 }, // Vazio
      ];

      // Formatar valores monetários
      incomeByCategory.forEach((_, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: index + 3, c: 1 });
        if (incomeByCatSheet[cellRef]) {
          incomeByCatSheet[cellRef].t = 'n';
          incomeByCatSheet[cellRef].z = '"R$"#,##0.00';
        }
      });

      // Formatar total
      const totalCellRef = XLSX.utils.encode_cell({ r: incomeByCategory.length + 5, c: 1 });
      if (incomeByCatSheet[totalCellRef]) {
        incomeByCatSheet[totalCellRef].t = 'n';
        incomeByCatSheet[totalCellRef].z = '"R$"#,##0.00';
        incomeByCatSheet[totalCellRef].s = { font: { bold: true } };
      }

      XLSX.utils.book_append_sheet(workbook, incomeByCatSheet, 'Categorias - Ganhos');
    }

    // ========== ABA 6: ANÁLISE FINANCEIRA ==========
    if (filteredTransactions.length > 0) {
      const expenses = filteredTransactions.filter(t => t.type === 'expense');
      const incomes = filteredTransactions.filter(t => t.type === 'income');
      
      const ticketMedioGastos = expenses.length > 0 ? totals.expense / expenses.length : 0;
      const ticketMedioGanhos = incomes.length > 0 ? totals.income / incomes.length : 0;
      const taxaPoupanca = totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(2) : '0';
      const maiorGasto = expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0;
      const menorGasto = expenses.length > 0 ? Math.min(...expenses.map(t => t.amount)) : 0;
      const maiorGanho = incomes.length > 0 ? Math.max(...incomes.map(t => t.amount)) : 0;
      const menorGanho = incomes.length > 0 ? Math.min(...incomes.map(t => t.amount)) : 0;
      const mediaGastos = expenses.length > 0 ? totals.expense / expenses.length : 0;
      const mediaGanhos = incomes.length > 0 ? totals.income / incomes.length : 0;

      const analysisData = [
        ['Análise Financeira', '', '', ''],
        ['', '', '', ''],
        ['Métrica', 'Valor', 'Descrição', ''],
        ['Ticket Médio (Gastos)', ticketMedioGastos, 'Valor médio gasto por transação', ''],
        ['Ticket Médio (Ganhos)', ticketMedioGanhos, 'Valor médio recebido por transação', ''],
        ['Taxa de Poupança', taxaPoupanca + '%', 'Percentual do saldo em relação aos ganhos', ''],
        ['Maior Gasto', maiorGasto, 'Maior valor gasto em uma transação', ''],
        ['Menor Gasto', menorGasto, 'Menor valor gasto em uma transação', ''],
        ['Maior Ganho', maiorGanho, 'Maior valor recebido em uma transação', ''],
        ['Menor Ganho', menorGanho, 'Menor valor recebido em uma transação', ''],
        ['Média de Gastos', mediaGastos, 'Média aritmética dos gastos', ''],
        ['Média de Ganhos', mediaGanhos, 'Média aritmética dos ganhos', ''],
        ['Saldo Final', totals.balance, totals.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo', ''],
      ];

      const analysisSheet = XLSX.utils.aoa_to_sheet(analysisData);
      
      analysisSheet['!cols'] = [
        { wch: 25 }, // Métrica
        { wch: 18 }, // Valor
        { wch: 45 }, // Descrição
        { wch: 10 }, // Vazio
      ];

      // Formatar valores monetários
      const moneyRows = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Linhas com valores monetários
      moneyRows.forEach(row => {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: 1 });
        if (analysisSheet[cellRef]) {
          analysisSheet[cellRef].t = 'n';
          analysisSheet[cellRef].z = '"R$"#,##0.00';
        }
      });

      // Formatar taxa de poupança (percentual)
      const taxaCellRef = XLSX.utils.encode_cell({ r: 5, c: 1 });
      if (analysisSheet[taxaCellRef]) {
        analysisSheet[taxaCellRef].t = 's'; // Tipo string para percentual já formatado
      }

      XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Análise Financeira');
    }

    // Gerar nome do arquivo
    const periodLabelFile = filterType === 'all' 
      ? 'Todas' 
      : filterType === 'week' 
        ? `Semana-${selectedDate.toISOString().slice(0, 10)}`
        : filterType === 'month'
          ? `${selectedDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}`
          : `${selectedDate.getFullYear()}`;
    
    const fileName = `Relatorio-${periodLabelFile}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    // Salvar arquivo
    XLSX.writeFile(workbook, fileName);
  }
}

