import { ServiceFactory } from '@/services';
import { AudioRecorder, SpeechTranscriber } from '@/services/audioService';
import { PermissionChecker } from '@/services/permissionChecker';
import { Category, RecordingState, Transaction } from '@/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Hook principal seguindo Single Responsibility Principle
export const useApp = () => {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
    hasPermission: false
  });
  const [currentTranscription, setCurrentTranscription] = useState<string>('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showPermissionsPrompt, setShowPermissionsPrompt] = useState(false);
  
  // Flag para evitar dupla inicialização no Strict Mode (desenvolvimento)
  const hasInitializedRef = useRef(false);

  // Dependency Injection seguindo Dependency Inversion Principle
  const transactionService = ServiceFactory.getTransactionService();
  const categoryService = ServiceFactory.getCategoryService();
  const offlineService = ServiceFactory.getOfflineService();
  
  const audioRecorder = useMemo(() => new AudioRecorder(), []);
  const transcriber = useMemo(() => new SpeechTranscriber(), []);

  // Métodos privados seguindo Single Responsibility Principle
  const loadTransactions = useCallback(async () => {
    try {
      const allTransactions = await transactionService.getAllTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }, [transactionService]);

  const loadCategories = useCallback(async () => {
    try {
      const allCategories = await categoryService.getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [categoryService]);

  const checkMicrophonePermission = useCallback(async () => {
    try {
      const hasPermission = await audioRecorder.checkMicrophonePermission();
      setRecordingState(prev => ({ ...prev, hasPermission }));
    } catch (error) {
      console.error('Error checking microphone permission:', error);
    }
  }, [audioRecorder]);

  const processOfflineAudio = useCallback(async () => {
    try {
      await offlineService.processOfflineAudio();
      await loadTransactions();
    } catch (error) {
      console.error('Error processing offline audio:', error);
    }
  }, [offlineService, loadTransactions]);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 [USEAPP] Iniciando gravação...');
      console.log('🔍 [USEAPP] Transcriber disponível:', !!transcriber);
      console.log('🔍 [USEAPP] Método startRealTimeTranscription:', typeof transcriber.startRealTimeTranscription);
      
      // Limpar transcrição anterior
      setCurrentTranscription('');
      
      // Iniciar transcrição em tempo real PRIMEIRO (como no SpeechTest)
      console.log('🔄 [USEAPP] Chamando startRealTimeTranscription...');
      
      try {
        transcriber.startRealTimeTranscription(
          (text: string) => {
            console.log(`📝 [USEAPP] Callback onResult chamado com: "${text}"`);
            setCurrentTranscription(text);
          },
          (error: Error) => {
            console.error('❌ [USEAPP] Callback onError chamado:', error);
            // Não parar a gravação se a transcrição falhar
          }
        );
        console.log('✅ [USEAPP] startRealTimeTranscription executado');
      } catch (err) {
        console.error('❌ [USEAPP] Erro ao chamar startRealTimeTranscription:', err);
      }
      
      // Então iniciar gravação de áudio
      console.log('🎙️ [USEAPP] Iniciando gravação de áudio...');
      await audioRecorder.startRecording();
      setRecordingState(prev => ({ ...prev, isRecording: true }));
      
      console.log('✅ [USEAPP] Gravação completa iniciada');
    } catch (error) {
      console.error('❌ [USEAPP] Error starting recording:', error);
      throw error;
    }
  }, [audioRecorder, transcriber]);

  const stopRecording = useCallback(async (transcriptionFromButton?: string) => {
    console.log('⏹️ [USEAPP] ==== STOPRECORDING CHAMADO ====');
    console.log('📝 [USEAPP] Transcrição recebida:', transcriptionFromButton);
    
    // Se veio transcrição do botão, processar direto (sem gravação de áudio)
    if (transcriptionFromButton) {
      console.log(`✅ [USEAPP] TEM TRANSCRIÇÃO! Processando: "${transcriptionFromButton}"`);
      
      try {
        console.log('🔄 [USEAPP] Setando estado para processando...');
        setRecordingState(prev => ({ ...prev, isProcessing: true }));
        
        const transcription = transcriptionFromButton.trim();
        console.log(`📋 [USEAPP] Texto trimado: "${transcription}"`);
        
        console.log('🔍 [USEAPP] Chamando parseTransaction...');
        const transactionData = transcriber.parseTransaction(transcription);
        console.log('💰 [USEAPP] Dados parseados:');
        console.log('   - Tipo:', transactionData.type);
        console.log('   - Valor:', transactionData.amount);
        console.log('   - Categoria:', transactionData.category);
        console.log('   - Descrição:', transactionData.description);
        
        // Garantir que há um valor mínimo
        if (transactionData.amount === 0) {
          console.log('⚠️ [USEAPP] Valor ZERO! Ajustando para 1');
          transactionData.amount = 1;
        }
        
        // Criar blob vazio de áudio
        const emptyBlob = new Blob([], { type: 'audio/webm' });
        console.log('📦 [USEAPP] Blob criado');
        
        console.log('💾 [USEAPP] Chamando addTransaction...');
        await transactionService.addTransaction({
          ...transactionData,
          audioBlob: emptyBlob
        });
        console.log('✅ [USEAPP] addTransaction COMPLETOU!');
        
        console.log('🔄 [USEAPP] Chamando loadTransactions...');
        await loadTransactions();
        console.log('✅ [USEAPP] loadTransactions COMPLETOU!');
        
        console.log('🎯 [USEAPP] Atualizando estado final...');
        setRecordingState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isProcessing: false 
        }));
        
        setCurrentTranscription('');
        console.log('🎉 [USEAPP] ==== TUDO PRONTO! ====');
        return;
      } catch (error: any) {
        console.error('❌❌❌ [USEAPP] ERRO FATAL:', error);
        console.error('Stack:', error?.stack);
        setRecordingState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isProcessing: false 
        }));
        throw error;
      }
    } else {
      console.log('⚠️ [USEAPP] SEM TRANSCRIÇÃO! Usando fluxo antigo');
    }
    
    // Fluxo antigo (com gravação de áudio)
    transcriber.stopRealTimeTranscription();
    
    const transcriptionText = currentTranscription;
    console.log(`📝 [USEAPP] Transcrição: "${transcriptionText}"`);

    const processAudioOnline = async (audioBlob: Blob): Promise<void> => {
      console.log('🎤 [USEAPP] Processando áudio...');
      
      let transcription = transcriptionText.trim();
      
      if (!transcription || transcription.trim().length === 0) {
        console.log('⚠️ [USEAPP] Transcrição vazia, usando padrão');
        transcription = 'Transação não transcrita';
      }
      
      console.log(`📋 [USEAPP] Texto para parsing: "${transcription}"`);
      const transactionData = transcriber.parseTransaction(transcription);
      console.log('💰 [USEAPP] Dados da transação:', transactionData);
      
      if (transactionData.amount === 0) {
        console.log('⚠️ [USEAPP] Valor zero, usando mínimo');
        transactionData.amount = 1;
      }
      
      await transactionService.addTransaction({
        ...transactionData,
        audioBlob: audioBlob
      });
      
      await loadTransactions();
    };

    const processAudioOffline = async (audioBlob: Blob): Promise<void> => {
      await offlineService.addToQueue(audioBlob);
    };

    try {
      setRecordingState(prev => ({ ...prev, isProcessing: true }));
      const audioBlob = await audioRecorder.stopRecording();
      
      if (isOnline) {
        await processAudioOnline(audioBlob);
      } else {
        await processAudioOffline(audioBlob);
      }
      
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isProcessing: false 
      }));
      
      setCurrentTranscription('');
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isProcessing: false 
      }));
      setCurrentTranscription('');
      throw error;
    }
  }, [isOnline, audioRecorder, transcriber, transactionService, offlineService, loadTransactions, currentTranscription]);

  // Event handlers seguindo Single Responsibility Principle
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    processOfflineAudio();
  }, [processOfflineAudio]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  // Effects seguindo Single Responsibility Principle
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  const initializeApp = useCallback(async (): Promise<void> => {
    // Evitar dupla inicialização no Strict Mode (desenvolvimento)
    if (hasInitializedRef.current) {
      console.log('⚠️ [USEAPP] App já inicializado, ignorando duplicação (Strict Mode)');
      return;
    }
    
    console.log('✅ [USEAPP] Inicializando app pela primeira vez...');
    hasInitializedRef.current = true;
    
    try {
      await categoryService.initializeDefaultCategories();
      await loadTransactions();
      await loadCategories();
      await checkMicrophonePermission();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }, [categoryService, loadTransactions, loadCategories, checkMicrophonePermission]);

  const checkInitialPermissions = useCallback(async () => {
    try {
      const permissionChecker = PermissionChecker.getInstance();
      const permissionInfo = await permissionChecker.getPermissionInfo();
      
      console.log('Permission info:', permissionInfo);
      
      if (permissionInfo.microphone === 'granted') {
        // Permissão já concedida
        setPermissionsGranted(true);
        setRecordingState(prev => ({ ...prev, hasPermission: true }));
        console.log('Microphone permission already granted');
      } else if (permissionInfo.microphone === 'prompt') {
        // Estado "perguntar" - mostrar prompt para solicitar
        console.log('Microphone permission in prompt state - showing permission request');
        setShowPermissionsPrompt(true);
      } else if (permissionInfo.microphone === 'denied') {
        // Permissão negada - mostrar mensagem
        console.log('Microphone permission denied');
        setShowPermissionsPrompt(true);
      } else {
        // Estado desconhecido - tentar solicitar
        console.log('Microphone permission unknown - attempting to request');
        setShowPermissionsPrompt(true);
      }
    } catch (error) {
      console.error('Erro ao verificar permissões iniciais:', error);
      setShowPermissionsPrompt(true);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    checkInitialPermissions();
  }, [checkInitialPermissions]);

  // Escutar evento de permissão concedida
  useEffect(() => {
    const handleMicrophonePermissionGranted = () => {
      setPermissionsGranted(true);
      setShowPermissionsPrompt(false);
      setRecordingState(prev => ({ ...prev, hasPermission: true }));
    };

    window.addEventListener('microphonePermissionGranted', handleMicrophonePermissionGranted);
    
    return () => {
      window.removeEventListener('microphonePermissionGranted', handleMicrophonePermissionGranted);
    };
  }, []);

  // Computed values seguindo Single Responsibility Principle
  const getTotalByType = useCallback((type: 'income' | 'expense'): number => {
    return transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTransactionsByCategory = useCallback((categoryName: string): Transaction[] => {
    return transactions.filter(t => t.category === categoryName);
  }, [transactions]);

  const getBalance = useCallback((): number => {
    return getTotalByType('income') - getTotalByType('expense');
  }, [getTotalByType]);

  // Funções de edição e exclusão
  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteTransaction = useCallback(async (id: number) => {
    try {
      await transactionService.deleteTransaction(id);
      await loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Erro ao excluir transação. Tente novamente.');
    }
  }, [transactionService, loadTransactions]);

  const handleSaveTransaction = useCallback(async (updatedTransaction: Omit<Transaction, 'id'>) => {
    try {
      if (editingTransaction?.id) {
        await transactionService.updateTransaction(editingTransaction.id, updatedTransaction);
        await loadTransactions();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    }
  }, [editingTransaction, transactionService, loadTransactions]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  }, []);

  // Funções de gerenciamento de permissões
  const handlePermissionsGranted = useCallback(() => {
    setPermissionsGranted(true);
    setShowPermissionsPrompt(false);
    setRecordingState(prev => ({ ...prev, hasPermission: true }));
  }, []);

  const handlePermissionsDenied = useCallback(() => {
    setShowPermissionsPrompt(false);
    // Ainda permite usar o app, mas sem gravação
    console.log('Permissões negadas - funcionalidade limitada');
  }, []);

  return {
    // State
    isOnline,
    transactions,
    categories,
    recordingState,
    currentTranscription,
    editingTransaction,
    isEditModalOpen,
    
    // Actions
    startRecording,
    stopRecording,
    
    // Computed values
    getTotalByType,
    getTransactionsByCategory,
    getBalance,
    
    // Utility methods
    loadTransactions,
    loadCategories,
    
    // Edit/Delete methods
    handleEditTransaction,
    handleDeleteTransaction,
    handleSaveTransaction,
    handleCloseEditModal,
    
    // Permission methods
    permissionsGranted,
    showPermissionsPrompt,
    handlePermissionsGranted,
    handlePermissionsDenied
  };
};