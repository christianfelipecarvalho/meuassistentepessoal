'use client';

import { AddTransactionModal } from '@/components/AddTransactionModal';
import { CategorySection } from '@/components/CategorySection';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { RecordingButton } from '@/components/RecordingButton';
import { Reports } from '@/components/Reports';
import { SummaryCards } from '@/components/SummaryCards';
import { Toast } from '@/components/Toast';
import { useApp } from '@/hooks/useApp';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [currentView, setCurrentView] = useState<'record' | 'list' | 'reports'>('record');
  const [debugMode, setDebugMode] = useState(false);
  const [selectedMonthList, setSelectedMonthList] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showToast, setShowToast] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const {
    isOnline,
    transactions,
    categories,
    recordingState,
    currentTranscription,
    editingTransaction,
    isEditModalOpen,
    startRecording,
    stopRecording,
    handleEditTransaction,
    handleDeleteTransaction,
    handleSaveTransaction,
    handleCloseEditModal,
    permissionsGranted
  } = useApp();

  // Função para mostrar toast
  const showSuccessToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Wrapper para stopRecording que mostra toast de sucesso
  const handleStopRecordingWithToast = async (transcription?: string) => {
    try {
      await stopRecording(transcription);
      
      // Se tem transcrição, significa que salvou algo
      if (transcription && transcription.trim().length > 0) {
        // Determinar se é gasto ou ganho pela transcrição
        const isExpense = transcription.toLowerCase().includes('gastei') || 
                         transcription.toLowerCase().includes('paguei') ||
                         transcription.toLowerCase().includes('comprei');
        const isIncome = transcription.toLowerCase().includes('recebi') || 
                        transcription.toLowerCase().includes('ganhei');
        
        let tipoTexto = 'Transação';
        if (isExpense) {
          tipoTexto = 'Gasto';
        } else if (isIncome) {
          tipoTexto = 'Ganho';
        }
        
        showSuccessToast(`${tipoTexto} registrado com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao processar transação:', error);
      showSuccessToast('Erro ao processar transação. Tente novamente.', 'error');
    }
  };

  // Função para adicionar nova transação manualmente
  const handleAddTransaction = async (newTransaction: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    date: Date;
  }) => {
    try {
      const { ServiceFactory } = await import('@/services');
      const transactionService = ServiceFactory.getTransactionService();
      
      // Criar blob vazio de áudio (transação manual não tem áudio)
      const emptyBlob = new Blob([], { type: 'audio/webm' });
      
      await transactionService.addTransaction({
        ...newTransaction,
        audioBlob: emptyBlob
      });
      
      // Mostrar mensagem de sucesso
      const tipoTexto = newTransaction.type === 'expense' ? 'Gasto' : 'Ganho';
      showSuccessToast(`${tipoTexto} registrado com sucesso!`);
      
      // Fechar modal
      setIsAddModalOpen(false);
      
      // Aguardar um pouco e recarregar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      showSuccessToast('Erro ao adicionar transação. Tente novamente.', 'error');
    }
  };

  const getTransactionsByCategory = (categoryName: string) => {
    return transactions.filter(t => t.category === categoryName);
  };

  // Filtrar transações por mês selecionado
  const getFilteredTransactions = () => {
    if (!transactions) {
      return [];
    }
    
    const selectedMonth = selectedMonthList.getMonth();
    const selectedYear = selectedMonthList.getFullYear();

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === selectedMonth &&
        transactionDate.getFullYear() === selectedYear
      );
    });
  };

  // Navegar para o mês anterior (lista)
  const handlePreviousMonthList = () => {
    setSelectedMonthList(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navegar para o próximo mês (lista)
  const handleNextMonthList = () => {
    setSelectedMonthList(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Verificar se é o mês atual (lista)
  const isCurrentMonthList = () => {
    const now = new Date();
    return selectedMonthList.getMonth() === now.getMonth() && 
           selectedMonthList.getFullYear() === now.getFullYear();
  };

  /**
   * Easter egg: Cliques rápidos no título ativa o modo debug
   * Configuração centralizada em @/config/debug
   */
  const handleTitleClick = () => {
    clickCountRef.current += 1;
    
    // Limpar timer anterior
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    // Se chegou ao número de cliques necessário, ativar/desativar debug
    if (clickCountRef.current >= 7) { // Usando constante de DEBUG_CONFIG
      const newDebugState = !debugMode;
      setDebugMode(newDebugState);
      clickCountRef.current = 0;
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        if (newDebugState) {
          localStorage.setItem('debug_mode', 'true');
        } else {
          localStorage.removeItem('debug_mode');
        }
        console.log('🔧 Modo debug:', newDebugState ? 'ATIVADO' : 'DESATIVADO');
      }
    }
    
    // Resetar contador após timeout
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);
  };

  /**
   * Atalho de teclado para debug mode
   * Ctrl + Shift + D
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        const newDebugState = !debugMode;
        setDebugMode(newDebugState);
        
        // Salvar no localStorage
        if (typeof window !== 'undefined') {
          if (newDebugState) {
            localStorage.setItem('debug_mode', 'true');
          } else {
            localStorage.removeItem('debug_mode');
          }
          console.log('🔧 Modo debug:', newDebugState ? 'ATIVADO' : 'DESATIVADO');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugMode]);

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <h1 onClick={handleTitleClick} style={{ cursor: 'pointer', userSelect: 'none' }}>
          💰 Meu Assistente Financeiro
        </h1>
        <div className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </div>
      </header>

      <main className={styles.mainContent}>
        {currentView === 'record' && (
          <div className={styles.recordView}>
            <RecordingButton
              recordingState={recordingState}
              currentTranscription={currentTranscription}
              onStartRecording={startRecording}
              onStopRecording={handleStopRecordingWithToast}
              permissionsGranted={permissionsGranted}
              showDebugLogs={debugMode}
            />
            <SummaryCards transactions={transactions} />
          </div>
        )}

        {currentView === 'list' && (
          <div className={styles.listView}>
            <h2>📋 Transações por Categoria</h2>
            
            {/* Navegação de Mês */}
            <div className={styles.monthNavigationList}>
              <button 
                className={styles.monthButtonList} 
                onClick={handlePreviousMonthList}
                title="Mês anterior"
              >
                ◀
              </button>
              <p className={styles.monthLabel}>
                {selectedMonthList.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
              <button 
                className={styles.monthButtonList} 
                onClick={handleNextMonthList}
                disabled={isCurrentMonthList()}
                title="Próximo mês"
              >
                ▶
              </button>
            </div>
            
            {categories && categories.length > 0 && categories.map(category => {
              const filteredTransactions = getFilteredTransactions();
              const categoryTransactions = filteredTransactions.filter(t => t.category === category.name);
              
              // Só mostrar categorias que têm transações no mês selecionado
              if (categoryTransactions.length === 0) {
                return null;
              }
              
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  transactions={categoryTransactions}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              );
            })}
            
            {(!getFilteredTransactions() || getFilteredTransactions().length === 0) && (
              <div className={styles.emptyState}>
                <p>📝 Nenhuma transação neste mês</p>
                <p>Navegue pelos meses ou grave uma nova transação!</p>
              </div>
            )}

            {/* Botão Flutuante para Adicionar Transação */}
            <button 
              className={styles.fabButton}
              onClick={() => setIsAddModalOpen(true)}
              title="Adicionar transação"
            >
              ➕
            </button>
          </div>
        )}

        {currentView === 'reports' && (
          <div className={styles.reportsView}>
            <Reports transactions={transactions || []} />
          </div>
        )}
      </main>

      <EditTransactionModal
        transaction={editingTransaction}
        categories={categories}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveTransaction}
      />

      <AddTransactionModal
        categories={categories}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddTransaction}
      />

      {/* Toast de Notificação */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Bottom Navigation - Estilo App Nativo */}
      <nav className={styles.bottomNavigation}>
        <button 
          className={`${styles.bottomNavButton} ${currentView === 'record' ? styles.active : ''}`}
          onClick={() => setCurrentView('record')}
        >
          <span className={styles.navIcon}>🎤</span>
          <span className={styles.navLabel}>Gravar</span>
        </button>
        <button 
          className={`${styles.bottomNavButton} ${currentView === 'list' ? styles.active : ''}`}
          onClick={() => setCurrentView('list')}
        >
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navLabel}>Lista</span>
        </button>
        <button 
          className={`${styles.bottomNavButton} ${currentView === 'reports' ? styles.active : ''}`}
          onClick={() => setCurrentView('reports')}
        >
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navLabel}>Relatórios</span>
        </button>
      </nav>
    </div>
  );
}
