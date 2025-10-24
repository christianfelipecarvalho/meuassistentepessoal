'use client';

import { CategorySection } from '@/components/CategorySection';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { PermissionDebug } from '@/components/PermissionDebug';
import { TranscriptionDebug } from '@/components/TranscriptionDebug';
import { RecordingButton } from '@/components/RecordingButton';
import { SummaryCards } from '@/components/SummaryCards';
import { useApp } from '@/hooks/useApp';
import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [currentView, setCurrentView] = useState<'record' | 'list'>('record');
  const [showDebug, setShowDebug] = useState(false);
  const [showTranscriptionDebug, setShowTranscriptionDebug] = useState(false);
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

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <h1>💰 Meu Assistente Financeiro</h1>
        <div className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </div>
      </header>

      <nav className={styles.navigation}>
        <button 
          className={`${styles.navButton} ${currentView === 'record' ? styles.active : ''}`}
          onClick={() => setCurrentView('record')}
        >
          🎤 Gravar
        </button>
        <button 
          className={`${styles.navButton} ${currentView === 'list' ? styles.active : ''}`}
          onClick={() => setCurrentView('list')}
        >
          📋 Lista
        </button>
               <button
                 className={styles.debugButton}
                 onClick={() => setShowDebug(true)}
                 title="Debug de Permissões"
               >
                 🔍
               </button>
               <button
                 className={styles.debugButton}
                 onClick={() => setShowTranscriptionDebug(true)}
                 title="Debug de Transcrição"
               >
                 🎤
               </button>
      </nav>

      <main className={styles.mainContent}>
        {currentView === 'record' && (
          <div className={styles.recordView}>
            <RecordingButton
              recordingState={recordingState}
              currentTranscription={currentTranscription}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              permissionsGranted={permissionsGranted}
            />
            <SummaryCards transactions={transactions} />
          </div>
        )}

        {currentView === 'list' && (
          <div className={styles.listView}>
            <h2>📋 Transações por Categoria</h2>
            
            {categories.map(category => {
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
            
            {transactions.length === 0 && (
              <div className={styles.emptyState}>
                <p>📝 Nenhuma transação registrada ainda</p>
                <p>Use a gravação de áudio para começar!</p>
              </div>
            )}
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

      <PermissionDebug
        isVisible={showDebug}
        onClose={() => setShowDebug(false)}
      />

      <TranscriptionDebug
        isVisible={showTranscriptionDebug}
        onClose={() => setShowTranscriptionDebug(false)}
      />
    </div>
  );
}
