import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Transaction } from '@/types';
import { formatCurrency, TimeFilterType, TransactionFilterUtils } from '@/utils';

interface ExportPDFOptions {
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

export class PDFExportService {
  // Função para remover emojis e caracteres especiais problemáticos
  private static removeEmojis(text: string): string {
    if (!text) {
      return text;
    }
    // Remove emojis e caracteres especiais Unicode
    // Usando ranges Unicode compatíveis sem flag 'u'
    return text
      .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]/g, '') // Emojis e símbolos
      .replace(/[\u2600-\u26FF]/g, '') // Símbolos diversos
      .replace(/[\u2700-\u27BF]/g, '') // Dingbats
      .replace(/[\uFE00-\uFE0F]/g, '') // Variantes
      .replace(/[\u200D]/g, '') // Zero Width Joiner
      .replace(/[\u200B]/g, '') // Zero Width Space
      .replace(/[\uFEFF]/g, '') // Zero Width No-Break Space
      .replace(/[\u202E]/g, '') // Right-to-Left Override
      .replace(/[\u202D]/g, '') // Left-to-Right Override
      .trim();
  }

  static async exportReport(options: ExportPDFOptions): Promise<void> {
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

    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const footerHeight = 15; // Espaço para o rodapé
    const availableHeight = pageHeight - margin - footerHeight; // Altura disponível na página
    let yPosition = margin;

    // Função para adicionar nova página se necessário
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > availableHeight) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Função para adicionar título
    const addTitle = (text: string, fontSize: number = 18) => {
      checkNewPage(fontSize + 5);
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'bold');
      pdf.text(text, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += fontSize / 2 + 5;
    };

    // Função para adicionar subtítulo
    const addSubtitle = (text: string, fontSize: number = 14) => {
      checkNewPage(fontSize + 3);
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'bold');
      pdf.text(text, margin, yPosition);
      yPosition += fontSize / 2 + 3;
    };

    // Função para adicionar texto
    const addText = (text: string, fontSize: number = 10, align: 'left' | 'center' | 'right' = 'left') => {
      checkNewPage(fontSize + 2);
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');
      const xPosition = align === 'center' ? pageWidth / 2 : align === 'right' ? pageWidth - margin : margin;
      pdf.text(text, xPosition, yPosition, { align });
      yPosition += fontSize / 2 + 2;
    };

    // Função para adicionar linha
    const addLine = () => {
      checkNewPage(5);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
    };

    // Cabeçalho
    addTitle('Relatorio Financeiro', 20);
    
    // Informações do período
    const periodLabel = TransactionFilterUtils.getPeriodLabel(filterType, selectedDate);
    addText(`Periodo: ${periodLabel}`, 12, 'center');
    yPosition += 3;

    // Informações do usuário
    if (userName || userEmail) {
      addLine();
      if (userName) {
        addText(`Usuario: ${this.removeEmojis(userName)}`, 10);
      }
      if (userEmail) {
        addText(`Email: ${userEmail}`, 10);
      }
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      addText(`Gerado em: ${dateStr} as ${timeStr}`, 10);
      addLine();
      yPosition += 5;
    }

    // Resumo Geral
    addSubtitle('Resumo Geral', 14);
    checkNewPage(30);
    
    // Cards de resumo
    const cardWidth = (pageWidth - 2 * margin - 10) / 3;
    
    // Card Ganhos
    pdf.setFillColor(34, 197, 94); // Verde
    pdf.rect(margin, yPosition, cardWidth, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ganhos', margin + cardWidth / 2, yPosition + 8, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text(formatCurrency(totals.income), margin + cardWidth / 2, yPosition + 16, { align: 'center' });
    
    // Card Gastos
    pdf.setFillColor(239, 68, 68); // Vermelho
    pdf.rect(margin + cardWidth + 5, yPosition, cardWidth, 25, 'F');
    pdf.text('Gastos', margin + cardWidth + 5 + cardWidth / 2, yPosition + 8, { align: 'center' });
    pdf.text(formatCurrency(totals.expense), margin + cardWidth + 5 + cardWidth / 2, yPosition + 16, { align: 'center' });
    
    // Card Saldo
    const balanceColor = totals.balance >= 0 ? [34, 197, 94] : [239, 68, 68];
    pdf.setFillColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    pdf.rect(margin + (cardWidth + 5) * 2, yPosition, cardWidth, 25, 'F');
    pdf.text('Saldo', margin + (cardWidth + 5) * 2 + cardWidth / 2, yPosition + 8, { align: 'center' });
    pdf.text(formatCurrency(totals.balance), margin + (cardWidth + 5) * 2 + cardWidth / 2, yPosition + 16, { align: 'center' });
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 30;

    // Lista de Transações
    const filteredTransactions = TransactionFilterUtils.filterByPeriod(transactions, filterType, selectedDate);
    
    if (filteredTransactions.length > 0) {
      addLine();
      yPosition += 5;
      
      // Gastos
      const expenses = filteredTransactions.filter(t => t.type === 'expense');
      if (expenses.length > 0) {
        addSubtitle('Gastos Detalhados', 12);
        checkNewPage(20);
        
        expenses.forEach((transaction, index) => {
          // Verificar se precisa de nova página antes de adicionar cada transação
          if (yPosition + 8 > availableHeight) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          
          const date = new Date(transaction.date).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
          });
          
          pdf.text(`${date}`, margin, yPosition);
          pdf.text(this.removeEmojis(transaction.category), margin + 30, yPosition);
          pdf.text(this.removeEmojis(transaction.description).substring(0, 40), margin + 80, yPosition);
          pdf.text(formatCurrency(transaction.amount), pageWidth - margin, yPosition, { align: 'right' });
          
          yPosition += 7;
        });
        
        yPosition += 5;
      }

      // Ganhos
      const incomes = filteredTransactions.filter(t => t.type === 'income');
      if (incomes.length > 0) {
        addSubtitle('Ganhos Detalhados', 12);
        checkNewPage(20);
        
        incomes.forEach((transaction) => {
          // Verificar se precisa de nova página antes de adicionar cada transação
          if (yPosition + 8 > availableHeight) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          
          const date = new Date(transaction.date).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
          });
          
          pdf.text(`${date}`, margin, yPosition);
          pdf.text(this.removeEmojis(transaction.category), margin + 30, yPosition);
          pdf.text(this.removeEmojis(transaction.description).substring(0, 40), margin + 80, yPosition);
          pdf.text(formatCurrency(transaction.amount), pageWidth - margin, yPosition, { align: 'right' });
          
          yPosition += 7;
        });
        
        yPosition += 5;
      }
    }

    // Gastos por Categoria
    if (expensesByCategory.length > 0) {
      addLine();
      yPosition += 5;
      addSubtitle('Gastos por Categoria', 12);
      checkNewPage(20);
      
      expensesByCategory.forEach((category) => {
        // Verificar se precisa de nova página antes de adicionar cada categoria
        if (yPosition + 8 > availableHeight) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(9);
        
        // Barra de cor
        const barWidth = totals.expense > 0 ? (category.value / totals.expense) * (pageWidth - 2 * margin - 60) : 0;
        pdf.setFillColor(239, 68, 68);
        pdf.rect(margin, yPosition - 3, barWidth, 4, 'F');
        
        pdf.text(this.removeEmojis(category.name), margin, yPosition);
        pdf.text(formatCurrency(category.value), pageWidth - margin - 40, yPosition, { align: 'right' });
        
        const percentage = totals.expense > 0 ? ((category.value / totals.expense) * 100).toFixed(1) : '0';
        pdf.text(`${percentage}%`, pageWidth - margin, yPosition, { align: 'right' });
        
        yPosition += 7;
      });
      yPosition += 5;
    }

    // Ganhos por Categoria
    if (incomeByCategory.length > 0) {
      addLine();
      yPosition += 5;
      addSubtitle('Ganhos por Categoria', 12);
      checkNewPage(20);
      
      incomeByCategory.forEach((category) => {
        // Verificar se precisa de nova página antes de adicionar cada categoria
        if (yPosition + 8 > availableHeight) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(9);
        
        // Barra de cor
        const barWidth = totals.income > 0 ? (category.value / totals.income) * (pageWidth - 2 * margin - 60) : 0;
        pdf.setFillColor(34, 197, 94);
        pdf.rect(margin, yPosition - 3, barWidth, 4, 'F');
        
        pdf.text(this.removeEmojis(category.name), margin, yPosition);
        pdf.text(formatCurrency(category.value), pageWidth - margin - 40, yPosition, { align: 'right' });
        
        const percentage = totals.income > 0 ? ((category.value / totals.income) * 100).toFixed(1) : '0';
        pdf.text(`${percentage}%`, pageWidth - margin, yPosition, { align: 'right' });
        
        yPosition += 7;
      });
      yPosition += 5;
    }

    // Análise Financeira
    if (filteredTransactions.length > 0) {
      addLine();
      yPosition += 5;
      addSubtitle('Analise Financeira', 12);
      checkNewPage(35);
      
      const expenses = filteredTransactions.filter(t => t.type === 'expense');
      const incomes = filteredTransactions.filter(t => t.type === 'income');
      
      const ticketMedioGastos = expenses.length > 0 ? totals.expense / expenses.length : 0;
      const ticketMedioGanhos = incomes.length > 0 ? totals.income / incomes.length : 0;
      const taxaPoupanca = totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(1) : '0';
      const maiorGasto = expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0;
      const maiorGanho = incomes.length > 0 ? Math.max(...incomes.map(t => t.amount)) : 0;
      
      pdf.setFontSize(9);
      pdf.text(`Ticket Medio (Gastos): ${formatCurrency(ticketMedioGastos)}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Ticket Medio (Ganhos): ${formatCurrency(ticketMedioGanhos)}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Taxa de Poupanca: ${taxaPoupanca}%`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Maior Gasto: ${formatCurrency(maiorGasto)}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Maior Ganho: ${formatCurrency(maiorGanho)}`, margin, yPosition);
    }

    // Rodapé
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Página ${i} de ${totalPages} - Meu Assistente Financeiro`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Gerar nome do arquivo
    const periodLabelFile = filterType === 'all' 
      ? 'Todas' 
      : filterType === 'week' 
        ? `Semana-${selectedDate.toISOString().slice(0, 10)}`
        : filterType === 'month'
          ? `${selectedDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}`
          : `${selectedDate.getFullYear()}`;
    
    const fileName = `Relatorio-${periodLabelFile}-${new Date().toISOString().slice(0, 10)}.pdf`;
    
    // Salvar PDF
    pdf.save(fileName);
  }

  static async exportReportWithCharts(options: ExportPDFOptions & { chartsContainer: HTMLElement }): Promise<void> {
    try {
      // Primeiro, gerar o PDF com dados textuais
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const footerHeight = 15; // Espaço para o rodapé
      const availableHeight = pageHeight - margin - footerHeight; // Altura disponível na página
      let yPosition = margin;

      // Funções auxiliares
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > availableHeight) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Cabeçalho
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatorio Financeiro', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Informações do período
      const periodLabel = TransactionFilterUtils.getPeriodLabel(options.filterType, options.selectedDate);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Periodo: ${periodLabel}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Informações do usuário
      if (options.userName || options.userEmail) {
        pdf.setFontSize(10);
        if (options.userName) {
          pdf.text(`Usuario: ${this.removeEmojis(options.userName)}`, margin, yPosition);
          yPosition += 5;
        }
        if (options.userEmail) {
          pdf.text(`Email: ${options.userEmail}`, margin, yPosition);
          yPosition += 5;
        }
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric'
        });
        const timeStr = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        pdf.text(`Gerado em: ${dateStr} as ${timeStr}`, margin, yPosition);
        yPosition += 8;
      }

      // Resumo Geral
      checkNewPage(30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Geral', margin, yPosition);
      yPosition += 8;

      const cardWidth = (pageWidth - 2 * margin - 10) / 3;
      
      // Card Ganhos
      pdf.setFillColor(34, 197, 94);
      pdf.rect(margin, yPosition, cardWidth, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text('Ganhos', margin + cardWidth / 2, yPosition + 8, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text(formatCurrency(options.totals.income), margin + cardWidth / 2, yPosition + 16, { align: 'center' });
      
      // Card Gastos
      pdf.setFillColor(239, 68, 68);
      pdf.rect(margin + cardWidth + 5, yPosition, cardWidth, 25, 'F');
      pdf.text('Gastos', margin + cardWidth + 5 + cardWidth / 2, yPosition + 8, { align: 'center' });
      pdf.text(formatCurrency(options.totals.expense), margin + cardWidth + 5 + cardWidth / 2, yPosition + 16, { align: 'center' });
      
      // Card Saldo
      const balanceColor = options.totals.balance >= 0 ? [34, 197, 94] : [239, 68, 68];
      pdf.setFillColor(balanceColor[0], balanceColor[1], balanceColor[2]);
      pdf.rect(margin + (cardWidth + 5) * 2, yPosition, cardWidth, 25, 'F');
      pdf.text('Saldo', margin + (cardWidth + 5) * 2 + cardWidth / 2, yPosition + 8, { align: 'center' });
      pdf.text(formatCurrency(options.totals.balance), margin + (cardWidth + 5) * 2 + cardWidth / 2, yPosition + 16, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      yPosition += 30;

      // Nova página para gráficos
      checkNewPage(20);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Graficos', margin, yPosition);
      yPosition += 10;

      // Capturar gráficos como imagem
      const canvas = await html2canvas(options.chartsContainer, {
        scale: 1.5, // Reduzir scale para melhor compatibilidade mobile
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        width: options.chartsContainer.scrollWidth,
        height: options.chartsContainer.scrollHeight
      });

      // Adicionar gráficos como imagem
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Garantir que a imagem caiba na página disponível
      const maxImgHeight = availableHeight - yPosition - 10; // -10 para margem de segurança
      if (imgHeight > maxImgHeight) {
        // Redimensionar a imagem para caber na página
        const scaleFactor = maxImgHeight / imgHeight;
        imgHeight = maxImgHeight;
        const scaledWidth = imgWidth * scaleFactor;
        const xOffset = (pageWidth - scaledWidth) / 2; // Centralizar
        checkNewPage(imgHeight + 10);
        pdf.addImage(imgData, 'PNG', xOffset, yPosition, scaledWidth, imgHeight);
        yPosition += imgHeight + 10;
      } else {
        checkNewPage(imgHeight + 10);
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      }

      // Lista de Transações
      const filteredTransactions = TransactionFilterUtils.filterByPeriod(
        options.transactions, 
        options.filterType, 
        options.selectedDate
      );
      
      if (filteredTransactions.length > 0) {
        // Nova página para transações
        checkNewPage(25);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        // Gastos Detalhados
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        if (expenses.length > 0) {
          checkNewPage(20);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Gastos Detalhados', margin, yPosition);
          yPosition += 10;

          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          expenses.forEach((transaction) => {
            // Verificar se precisa de nova página antes de adicionar cada transação
            if (yPosition + 8 > availableHeight) {
              pdf.addPage();
              yPosition = margin;
            }
            const date = new Date(transaction.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            });
            pdf.text(`${date}`, margin, yPosition);
            pdf.text(this.removeEmojis(transaction.category), margin + 30, yPosition);
            pdf.text(this.removeEmojis(transaction.description).substring(0, 40), margin + 80, yPosition);
            pdf.text(formatCurrency(transaction.amount), pageWidth - margin, yPosition, { align: 'right' });
            yPosition += 7;
          });
          yPosition += 8;
        }

        // Ganhos Detalhados
        const incomes = filteredTransactions.filter(t => t.type === 'income');
        if (incomes.length > 0) {
          checkNewPage(20);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Ganhos Detalhados', margin, yPosition);
          yPosition += 10;

          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          incomes.forEach((transaction) => {
            // Verificar se precisa de nova página antes de adicionar cada transação
            if (yPosition + 8 > availableHeight) {
              pdf.addPage();
              yPosition = margin;
            }
            const date = new Date(transaction.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            });
            pdf.text(`${date}`, margin, yPosition);
            pdf.text(this.removeEmojis(transaction.category), margin + 30, yPosition);
            pdf.text(this.removeEmojis(transaction.description).substring(0, 40), margin + 80, yPosition);
            pdf.text(formatCurrency(transaction.amount), pageWidth - margin, yPosition, { align: 'right' });
            yPosition += 7;
          });
          yPosition += 8;
        }

        // Gastos por Categoria (resumo)
        if (options.expensesByCategory.length > 0) {
          checkNewPage(25);
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Gastos por Categoria', margin, yPosition);
          yPosition += 10;

          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          options.expensesByCategory.forEach((category) => {
            // Verificar se precisa de nova página antes de adicionar cada categoria
            if (yPosition + 8 > availableHeight) {
              pdf.addPage();
              yPosition = margin;
            }
            const barWidth = options.totals.expense > 0 ? (category.value / options.totals.expense) * (pageWidth - 2 * margin - 60) : 0;
            pdf.setFillColor(239, 68, 68);
            pdf.rect(margin, yPosition - 3, barWidth, 4, 'F');
            pdf.text(this.removeEmojis(category.name), margin, yPosition);
            pdf.text(formatCurrency(category.value), pageWidth - margin - 40, yPosition, { align: 'right' });
            const percentage = options.totals.expense > 0 ? ((category.value / options.totals.expense) * 100).toFixed(1) : '0';
            pdf.text(`${percentage}%`, pageWidth - margin, yPosition, { align: 'right' });
            yPosition += 7;
          });
          yPosition += 5;
        }

        // Ganhos por Categoria (resumo)
        if (options.incomeByCategory.length > 0) {
          checkNewPage(25);
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Ganhos por Categoria', margin, yPosition);
          yPosition += 10;

          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          options.incomeByCategory.forEach((category) => {
            // Verificar se precisa de nova página antes de adicionar cada categoria
            if (yPosition + 8 > availableHeight) {
              pdf.addPage();
              yPosition = margin;
            }
            const barWidth = options.totals.income > 0 
              ? (category.value / options.totals.income) * (pageWidth - 2 * margin - 60) 
              : 0;
            pdf.setFillColor(34, 197, 94);
            pdf.rect(margin, yPosition - 3, barWidth, 4, 'F');
            pdf.text(this.removeEmojis(category.name), margin, yPosition);
            pdf.text(formatCurrency(category.value), pageWidth - margin - 40, yPosition, { align: 'right' });
            const percentage = options.totals.income > 0 
              ? ((category.value / options.totals.income) * 100).toFixed(1) 
              : '0';
            pdf.text(`${percentage}%`, pageWidth - margin, yPosition, { align: 'right' });
            yPosition += 7;
          });
          yPosition += 5;
        }

        // Análise Financeira
        if (filteredTransactions.length > 0) {
          checkNewPage(35);
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Analise Financeira', margin, yPosition);
          yPosition += 10;

          const ticketMedioGastos = expenses.length > 0 ? options.totals.expense / expenses.length : 0;
          const ticketMedioGanhos = incomes.length > 0 ? options.totals.income / incomes.length : 0;
          const taxaPoupanca = options.totals.income > 0 
            ? ((options.totals.balance / options.totals.income) * 100).toFixed(1) 
            : '0';
          const maiorGasto = expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0;
          const maiorGanho = incomes.length > 0 ? Math.max(...incomes.map(t => t.amount)) : 0;

          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Ticket Medio (Gastos): ${formatCurrency(ticketMedioGastos)}`, margin, yPosition);
          yPosition += 7;
          pdf.text(`Ticket Medio (Ganhos): ${formatCurrency(ticketMedioGanhos)}`, margin, yPosition);
          yPosition += 7;
          pdf.text(`Taxa de Poupanca: ${taxaPoupanca}%`, margin, yPosition);
          yPosition += 7;
          pdf.text(`Maior Gasto: ${formatCurrency(maiorGasto)}`, margin, yPosition);
          yPosition += 7;
          pdf.text(`Maior Ganho: ${formatCurrency(maiorGanho)}`, margin, yPosition);
        }
      }

      // Rodapé
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(
          `Página ${i} de ${totalPages} - Meu Assistente Financeiro`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Gerar nome do arquivo
      const periodLabelFile = options.filterType === 'all' 
        ? 'Todas' 
        : options.filterType === 'week' 
          ? `Semana-${options.selectedDate.toISOString().slice(0, 10)}`
          : options.filterType === 'month'
            ? `${options.selectedDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}`
            : `${options.selectedDate.getFullYear()}`;
      
      const fileName = `Relatorio-${periodLabelFile}-${new Date().toISOString().slice(0, 10)}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao exportar PDF com gráficos:', error);
      // Fallback para exportação sem gráficos
      await this.exportReport(options);
    }
  }
}

