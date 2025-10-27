'use client';

import { CategorySection } from '@/components/CategorySection';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { RecordingButton } from '@/components/RecordingButton';
import { Reports } from '@/components/Reports';
import { SummaryCards } from '@/components/SummaryCards';
import { useApp } from '@/hooks/useApp';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [currentView, setCurrentView] = useState<'record' | 'list' | 'reports'>('record');
  const [debugMode, setDebugMode] = useState(false);
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

  const getTransactionsByCategory = (categoryName: string) => {
    return transactions.filter(t => t.category === categoryName);
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
              onStopRecording={(transcription) => stopRecording(transcription)}
              permissionsGranted={permissionsGranted}
              showDebugLogs={debugMode}
            />
            <SummaryCards transactions={transactions} />
          </div>
        )}

        {currentView === 'list' && (
          <div className={styles.listView}>
            <h2>📋 Transações por Categoria</h2>
            
            {categories && categories.length > 0 && categories.map(category => {
              const categoryTransactions = getTransactionsByCategory(category.name);
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
            
            {(!transactions || transactions.length === 0) && (
              <div className={styles.emptyState}>
                <p>📝 Nenhuma transação registrada ainda</p>
                <p>Use a gravação de áudio para começar!</p>
              </div>
            )}
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
