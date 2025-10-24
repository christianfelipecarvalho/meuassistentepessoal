import { ServiceFactory } from '@/services';
import { AudioRecorder, SpeechTranscriber } from '@/services/audioService';
import { PermissionChecker } from '@/services/permissionChecker';
import { Category, RecordingState, Transaction } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
      console.log('🎤 [USEAPP] Iniciando gravação principal...');
      
      // Primeiro iniciar a gravação de áudio
      await audioRecorder.startRecording();
      setRecordingState(prev => ({ ...prev, isRecording: true }));
      setCurrentTranscription('');
      
      // Aguardar um pouco para garantir que a gravação iniciou
      console.log('⏳ [USEAPP] Aguardando estabilização da gravação...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Iniciar transcrição em tempo real
      console.log('🔄 [USEAPP] Iniciando transcrição em tempo real...');
      transcriber.startRealTimeTranscription(
        (text: string) => {
          console.log(`📝 [USEAPP] Transcrição em tempo real recebida: "${text}"`);
          setCurrentTranscription(text);
        },
        (error: Error) => {
          console.error('❌ [USEAPP] Erro na transcrição em tempo real:', error);
          // Não parar a gravação se a transcrição falhar
        }
      );
    } catch (error) {
      console.error('❌ [USEAPP] Error starting recording:', error);
      throw error;
    }
  }, [audioRecorder, transcriber]);

  const stopRecording = useCallback(async () => {
    console.log('⏹️ [USEAPP] Parando gravação principal...');
    
    // Parar transcrição em tempo real primeiro
    console.log('🔄 [USEAPP] Parando transcrição em tempo real...');
    transcriber.stopRealTimeTranscription();
    
    // Aguardar um pouco para garantir que a transcrição finalizou
    console.log('⏳ [USEAPP] Aguardando finalização da transcrição...');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`📝 [USEAPP] Transcrição final capturada: "${currentTranscription}"`);

    // Métodos auxiliares seguindo Single Responsibility Principle
    const processAudioOnline = async (audioBlob: Blob): Promise<void> => {
      console.log('🎤 [USEAPP] Processando áudio online...');
      
      // Usar a transcrição em tempo real se disponível
      let transcription = currentTranscription.trim();
      console.log(`📝 [USEAPP] Transcrição atual: "${transcription}"`);
      
      // Para mobile, não tentar transcrever áudio gravado
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (!transcription && !isMobile) {
        try {
          console.log('🔄 [USEAPP] Tentando transcrever áudio gravado (desktop)...');
          transcription = await transcriber.transcribeAudio(audioBlob);
          console.log(`✅ [USEAPP] Transcrição do áudio: "${transcription}"`);
        } catch (error) {
          console.error('❌ [USEAPP] Erro na transcrição do áudio:', error);
          transcription = 'Transação não transcrita - valor não detectado';
        }
      } else if (!transcription && isMobile) {
        console.log('📱 [USEAPP] Mobile: usando apenas transcrição em tempo real');
        transcription = 'Transação não transcrita - valor não detectado';
      }
      
      // Se ainda não há transcrição válida, criar uma transação padrão
      if (!transcription || transcription.trim().length === 0) {
        console.log('⚠️ [USEAPP] Transcrição vazia, usando padrão');
        transcription = 'Transação não transcrita - valor não detectado';
      }
      
      console.log(`📋 [USEAPP] Texto final para parsing: "${transcription}"`);
      const transactionData = transcriber.parseTransaction(transcription);
      console.log('💰 [USEAPP] Dados da transação:', transactionData);
      
      // Garantir que há um valor mínimo
      if (transactionData.amount === 0) {
        console.log('⚠️ [USEAPP] Valor zero detectado, usando valor mínimo');
        transactionData.amount = 1; // Valor mínimo
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
      
      // Limpar transcrição atual
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