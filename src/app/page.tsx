'use client';

import { AddTransactionModal } from '@/components/AddTransactionModal';
import { AdBanner } from '@/components/AdBanner';
import { AdVertical } from '@/components/AdVertical';
import { CategorySection } from '@/components/CategorySection';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { EnvironmentBadge } from '@/components/EnvironmentBadge';
import { FeedbackModal } from '@/components/FeedbackModal';
import { InitialSetupModal } from '@/components/InitialSetupModal';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Profile } from '@/components/Profile';
import { RecordingButton } from '@/components/RecordingButton';
import { Reports } from '@/components/Reports';
import { SummaryCards } from '@/components/SummaryCards';
import { TimeFilter } from '@/components/TimeFilter';
import { Toast } from '@/components/Toast';
import { useApp } from '@/hooks/useApp';
import { useAdSenseControl } from '@/hooks/useAdSenseControl';
import { TimeFilterType, TransactionFilterUtils } from '@/utils';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [currentView, setCurrentView] = useState<'record' | 'list' | 'reports' | 'profile'>('record');
  const [debugMode, setDebugMode] = useState(false);
  const [filterTypeList, setFilterTypeList] = useState<TimeFilterType>('month');
  const [selectedDateList, setSelectedDateList] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showToast, setShowToast] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [hasVerticalAd, setHasVerticalAd] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackPromptTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adSidebarRef = useRef<HTMLDivElement>(null);

  // Verificar se já configurou email na primeira vez
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      setShowSetupModal(true);
    } else {
      setUserEmail(email);
    }
  }, []);

  // Mostrar popup de avaliação periodicamente (a cada 5 minutos)
  useEffect(() => {
    // Só mostrar se já configurou email e ainda não avaliou
    if (localStorage.getItem('userEmail') && !localStorage.getItem('hasReviewed')) {
      // Primeiro aviso após 2 minutos
      const timer = setTimeout(() => {
        setShowFeedbackPrompt(true);
      }, 2 * 60 * 1000); // 2 minutos

      return () => clearTimeout(timer);
    }
  }, []);

  // Verificar se há anúncio vertical renderizado na sidebar
  useEffect(() => {
    if (currentView !== 'list') {
      setHasVerticalAd(false);
      return;
    }

    let checkInterval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;

    // Aguardar um pouco para o DOM atualizar
    const initialTimeout = setTimeout(() => {
      const checkForAd = () => {
        const sidebar = adSidebarRef.current;
        if (sidebar) {
          // Verificar se há algum elemento filho (o AdVertical renderizado)
          // Se o AdVertical retorna null, a sidebar não terá filhos
          const hasContent = sidebar.children.length > 0 && 
                            sidebar.querySelector('[class*="adContainer"]') !== null;
          setHasVerticalAd(hasContent);
          return hasContent;
        }
        setHasVerticalAd(false);
        return false;
      };

      // Verificar imediatamente
      checkForAd();

      // Verificar periodicamente se há conteúdo na sidebar
      checkInterval = setInterval(() => {
        checkForAd();
      }, 500);

      // Timeout para parar de verificar após 3 segundos
      timeout = setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
        }
        checkForAd();
      }, 3000);
    }, 100);

    return () => {
      clearTimeout(initialTimeout);
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [currentView]);
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

  // Controle centralizado de exibição de anúncios (conformidade AdSense)
  const { canShowAds } = useAdSenseControl({
    showSetupModal,
    isEditModalOpen,
    isAddModalOpen,
    transactions,
    currentView,
    filterTypeList,
    selectedDateList,
  });

  // Função para mostrar toast
  const showSuccessToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Função para configurar email inicial
  const handleSetupComplete = (email: string) => {
    localStorage.setItem('userEmail', email);
    setUserEmail(email);
    setShowSetupModal(false);
    showSuccessToast('Configuração salva com sucesso!', 'success');
  };

  // Função para enviar notificação ao Telegram
  const sendTelegramNotification = async (message: string) => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      return; // Se não tem email, não envia notificação
    }

    try {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message }),
      });
    } catch (error) {
      console.error('Erro ao enviar notificação no Telegram:', error);
    }
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
        
        // Enviar notificação ao Telegram
        await sendTelegramNotification(
          `🆕 Nova transação registrada: ${tipoTexto} - ${transcription}`
        );
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

  // Filtrar transações por período selecionado
  const getFilteredTransactions = () => {
    if (!transactions) {
      return [];
    }
    
    return TransactionFilterUtils.filterByPeriod(transactions, filterTypeList, selectedDateList);
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
        <div className={styles.headerLeft}>
          <EnvironmentBadge />
          <div className={styles.titleContainer}>
            <h1 onClick={handleTitleClick} className={styles.headerTitle}>
              💰 Meu Assistente Financeiro
            </h1>
            <div className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className={styles.feedbackButton}
            title="Avaliar app"
            type="button"
          >
            ⭐<span className={styles.buttonLabel}>Avaliar</span>
          </button>
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
            
            {/* Dicas de gravação */}
            <div className={styles.recordingTips}>
              <h3>💡 Como falar:</h3>
              <div className={styles.tipsGrid}>
                <div className={styles.tipCard}>
                  <span className={styles.tipEmoji}>💸</span>
                  <div className={styles.tipContent}>
                    <strong>Gastos:</strong>
                    <p>Gastei <span className={styles.highlight}>R$ 50</span> no mercado</p>
                  </div>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipEmoji}>💰</span>
                  <div className={styles.tipContent}>
                    <strong>Ganhos:</strong>
                    <p>Recebi <span className={styles.highlight}>R$ 500</span> de salário</p>
                  </div>
                </div>
              </div>
              <p className={styles.tipsNote}>✨ Seja natural: diga o valor e o motivo</p>
            </div>
            
            <SummaryCards transactions={transactions} />
            
            {/* Anúncio in-article após resumo */}
            <AdBanner 
              adSlot="7875119612" 
              adLayout="in-article" 
              compact 
              disabled={!canShowAds}
            />
          </div>
        )}

        {currentView === 'list' && (
          <div className={styles.listView}>
            <div className={styles.listHeader}>
              <h2>📋 Transações por Categoria</h2>
              
              <TimeFilter
                filterType={filterTypeList}
                onFilterChange={setFilterTypeList}
                referenceDate={selectedDateList}
                onDateChange={setSelectedDateList}
              />
            </div>
            
            <div className={`${styles.listContent} ${!hasVerticalAd ? styles.noSidebar : ''}`}>
              <div className={styles.listMain}>
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
                <p>📝 Nenhuma transação no período selecionado</p>
                <p>Altere o filtro ou grave uma nova transação!</p>
              </div>
            )}

            {/* Anúncio in-article no final da lista */}
            <AdBanner 
              adSlot="7875119612" 
              adLayout="in-article" 
              compact 
              disabled={!canShowAds}
            />
              </div>
              
              {/* Anúncio vertical (desktop) */}
              <div ref={adSidebarRef} className={styles.adSidebar}>
                <AdVertical disabled={!canShowAds} />
              </div>
            </div>

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
            <Reports 
              transactions={transactions || []} 
              userName={localStorage.getItem('userName') || undefined}
              userEmail={userEmail || undefined}
              canShowAds={canShowAds}
            />
          </div>
        )}

        {currentView === 'profile' && (
          <div className={styles.profileView}>
            <Profile userEmail={userEmail} />
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

      {/* Modal de Configuração Inicial */}
      <InitialSetupModal
        isOpen={showSetupModal}
        onComplete={handleSetupComplete}
      />

      {/* Modal de Feedback */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onComplete={() => {
          setShowFeedbackModal(false);
          showSuccessToast('Obrigado pelo feedback!', 'success');
        }}
      />

      {/* Popup Flutuante de Feedback */}
      {showFeedbackPrompt && (
        <div className={styles.feedbackPrompt}>
          <div className={styles.feedbackPromptContent}>
            <button
              className={styles.feedbackPromptClose}
              onClick={() => setShowFeedbackPrompt(false)}
              title="Fechar"
            >
              ✕
            </button>
            <div className={styles.feedbackPromptIcon}>⭐</div>
            <h3>Avalie nosso app!</h3>
            <p>Sua opinião é muito importante para nós</p>
            <button
              className={styles.feedbackPromptButton}
              onClick={() => {
                setShowFeedbackPrompt(false);
                setShowFeedbackModal(true);
              }}
            >
              Avaliar agora
            </button>
          </div>
        </div>
      )}

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
        <button 
          className={`${styles.bottomNavButton} ${currentView === 'profile' ? styles.active : ''}`}
          onClick={() => setCurrentView('profile')}
        >
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navLabel}>Perfil</span>
        </button>
      </nav>

      {/* Prompt de Instalação PWA */}
      <InstallPrompt />
    </div>
  );
}
