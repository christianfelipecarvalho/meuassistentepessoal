import { PermissionChecker } from '@/services/permissionChecker';
import { RecordingState } from '@/types';
import React, { useEffect, useState } from 'react';
import styles from './RecordingButton.module.css';

interface RecordingButtonProps {
  recordingState: RecordingState;
  currentTranscription: string;
  onStartRecording: () => void;
  onStopRecording: (transcription?: string) => void;
  permissionsGranted?: boolean;
}

const addLog = (message: string, logs: string[], setLogs: React.Dispatch<React.SetStateAction<string[]>>) => {
  const timestamp = new Date().toLocaleTimeString();
  setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
};

export const RecordingButton: React.FC<RecordingButtonProps> = ({
  recordingState,
  currentTranscription,
  onStartRecording,
  onStopRecording,
  permissionsGranted = true
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [localTranscript, setLocalTranscript] = useState('');

  const checkSupport = () => {
    addLog('🔍 Verificando suporte ao Speech Recognition...', logs, setLogs);
    const hasWebkit = !!(window as any).webkitSpeechRecognition;
    const hasStandard = !!(window as any).SpeechRecognition;
    addLog(`webkitSpeechRecognition: ${hasWebkit}`, logs, setLogs);
    addLog(`SpeechRecognition: ${hasStandard}`, logs, setLogs);
    const supported = hasWebkit || hasStandard;
    setIsSupported(supported);
    
    if (supported && !recognition) {
      addLog('🔧 Criando instância do Speech Recognition...', logs, setLogs);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = 'pt-BR';
      
      setRecognition(newRecognition);
      addLog('✅ Instância criada e configurada', logs, setLogs);
    }
    
    addLog(supported ? '✅ Speech Recognition suportado!' : '❌ Speech Recognition NÃO suportado', logs, setLogs);
  };

  const startListening = async () => {
    if (!isSupported || !recognition) {
      addLog('❌ Speech Recognition não suportado ou não inicializado', logs, setLogs);
      return;
    }

    if (isListening) {
      addLog('⚠️ Já está escutando, ignorando...', logs, setLogs);
      return;
    }

    addLog('🎤 Iniciando escuta...', logs, setLogs);
    addLog(`Idioma: ${recognition.lang}`, logs, setLogs);
    addLog(`Contínuo: ${recognition.continuous}`, logs, setLogs);
    addLog(`Resultados interim: ${recognition.interimResults}`, logs, setLogs);

    // Resetar transcrição local
    setLocalTranscript('');

    recognition.onstart = () => {
      addLog('✅ Escuta iniciada', logs, setLogs);
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      addLog(`📝 Resultado recebido (${event.results.length} resultados)`, logs, setLogs);
      
      // Reconstruir o texto completo a partir de TODOS os resultados finais
      let fullFinalTranscript = '';
      let currentInterim = '';

      // Iterar por TODOS os resultados para pegar o texto completo
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullFinalTranscript += transcript + ' ';
        } else {
          currentInterim += transcript;
        }
      }

      // Verificar se teve novo resultado final
      let newFinal = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newFinal = event.results[i][0].transcript;
          break;
        }
      }

      if (newFinal) {
        addLog(`✅ Final: "${newFinal}"`, logs, setLogs);
      }

      // Atualizar com o texto completo (todos os finais + interim atual)
      const completeText = (fullFinalTranscript.trim() + ' ' + currentInterim).trim();
      setLocalTranscript(completeText);
      
      if (currentInterim) {
        addLog(`🔄 Interim: "${currentInterim}"`, logs, setLogs);
      }
    };

    recognition.onerror = (event: any) => {
      addLog(`❌ Erro: ${event.error}`, logs, setLogs);
      setIsListening(false);
    };

    recognition.onend = () => {
      addLog('⏹️ Escuta finalizada', logs, setLogs);
      setIsListening(false);
    };

    try {
      // NÃO iniciar gravação de áudio para evitar conflito de microfone
      // Usar APENAS Speech Recognition (igual ao teste que funciona)
      addLog('🔊 Solicitando acesso ao microfone...', logs, setLogs);
      recognition.start();
      addLog('🚀 recognition.start() chamado', logs, setLogs);
    } catch (error) {
      addLog(`❌ Erro ao iniciar: ${error}`, logs, setLogs);
    }
  };

  const stopListening = async () => {
    addLog('⏹️ Parando escuta...', logs, setLogs);
    
    if (recognition && isListening) {
      try {
        recognition.stop();
        addLog('✅ Escuta parada', logs, setLogs);
      } catch (error) {
        addLog(`❌ Erro ao parar: ${error}`, logs, setLogs);
      }
    } else {
      addLog('⚠️ Nenhuma escuta ativa', logs, setLogs);
    }
    
    const finalText = localTranscript.trim();
    addLog(`📋 Texto transcrito: "${finalText}"`, logs, setLogs);
    addLog(`📏 Tamanho: ${finalText.length} caracteres`, logs, setLogs);
    
    if (!finalText || finalText.length === 0) {
      addLog('⚠️ Nenhum texto transcrito!', logs, setLogs);
      setIsListening(false);
      setLocalTranscript('');
      return;
    }
    
    // Capturar logs do console para mostrar na tela
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('[USEAPP]')) {
        addLog(message.replace('[USEAPP] ', ''), logs, setLogs);
      }
      originalLog(...args);
    };
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('[USEAPP]')) {
        addLog(`❌ ${message.replace('[USEAPP] ', '')}`, logs, setLogs);
      }
      originalError(...args);
    };
    
    // Enviar transcrição para salvar
    if (onStopRecording) {
      addLog('💾 Enviando para salvar...', logs, setLogs);
      try {
        await onStopRecording(finalText);
        addLog('✅ Transação processada!', logs, setLogs);
      } catch (error) {
        addLog(`❌ Erro ao salvar: ${error}`, logs, setLogs);
        console.error('Erro completo:', error);
      }
    }
    
    // Restaurar console
    setTimeout(() => {
      console.log = originalLog;
      console.error = originalError;
    }, 1000);
    
    setIsListening(false);
    // Limpar transcrição local para próxima gravação
    setLocalTranscript('');
  };

  // Verificar suporte automaticamente ao montar o componente
  useEffect(() => {
    checkSupport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Adicionar log quando o estado de processamento mudar
  useEffect(() => {
    if (recordingState.isProcessing) {
      addLog('⏳ Processando transação...', logs, setLogs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingState.isProcessing]);

  const handleClick = () => {
    if (!permissionsGranted) {
      // Se não tem permissão, solicitar imediatamente
      addLog('❌ Permissão de microfone não concedida', logs, setLogs);
      requestMicrophonePermission();
      return;
    }
    
    // Verificar suporte primeiro
    if (!isSupported) {
      addLog('⚠️ Verificando suporte...', logs, setLogs);
      checkSupport();
      return;
    }
    
    // Usar sistema local (igual ao SpeechTest que funciona)
    if (!isListening) {
      addLog('🎤 Botão clicado - Iniciando...', logs, setLogs);
      startListening();
    } else {
      addLog('⏹️ Botão clicado - Parando...', logs, setLogs);
      stopListening();
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const permissionChecker = PermissionChecker.getInstance();
      const success = await permissionChecker.requestMicrophonePermission();
      
      if (success) {
        // Se chegou até aqui, permissão foi concedida
        console.log('Microphone permission granted via button');
        window.dispatchEvent(new CustomEvent('microphonePermissionGranted'));
        // Verificar suporte após permissão
        checkSupport();
      } else {
        console.log('Microphone permission denied via button');
        alert('Permissão de microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador.');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de microfone:', error);
      alert('Erro ao solicitar permissão de microfone. Tente novamente.');
    }
  };

  const getButtonText = () => {
    if (!permissionsGranted) {
      return '🎤 Permitir Microfone';
    }
    if (!isSupported) {
      return '🔍 Verificar Suporte';
    }
    if (isListening) {
      return '🔴 Parar Gravação';
    }
    if (recordingState.isProcessing) {
      return '⏳ Processando...';
    }
    return '🎤 Gravar Gasto/Ganho';
  };

  const getInstructionText = () => {
    if (!permissionsGranted) {
      return 'Clique no botão para permitir o acesso ao microfone';
    }
    if (!isSupported) {
      return 'Clique para verificar suporte ao Speech Recognition';
    }
    if (isListening) {
      return 'Fale seu gasto ou ganho. Ex: "Gastei 25 reais no almoço"';
    }
    if (recordingState.isProcessing) {
      return 'Processando sua transação...';
    }
    return 'Clique para gravar seu gasto ou ganho';
  };

  return (
    <div className={styles.recordingSection}>
      <div className={styles.recordingButtonContainer}>
        <button
          className={`${styles.recordingButton} ${
            isListening ? styles.recording : ''
          } ${!permissionsGranted ? styles.disabled : ''}`}
          onClick={handleClick}
          disabled={!permissionsGranted || recordingState.isProcessing}
        >
          {getButtonText()}
        </button>
      </div>
      
      <p className={styles.recordingInstruction}>
        {getInstructionText()}
      </p>
      
      {/* Status do Speech Recognition */}
      <div className={styles.statusContainer}>
        <p>Suporte: <span className={isSupported ? styles.supported : styles.notSupported}>
          {isSupported ? '✅ Suportado' : '❌ Não Suportado'}
        </span></p>
        <p>Gravando: <span className={isListening ? styles.listening : styles.notListening}>
          {isListening ? '🟢 Sim' : '🔴 Não'}
        </span></p>
        <p>Transcrição: <span className={styles.currentTranscript}>
          {localTranscript || currentTranscription || 'N/A'}
        </span></p>
      </div>

      {/* Logs de Debug */}
      <div className={styles.logsContainer}>
        <h3 className={styles.logsTitle}>📋 Logs de Debug ({logs.length}):</h3>
        <div className={styles.logsContent}>
          {logs.length === 0 ? (
            <div className={styles.logEntry}>Nenhum log ainda...</div>
          ) : (
            logs.slice(-30).map((log, index) => (
              <div key={index} className={styles.logEntry}>
                {log}
              </div>
            ))
          )}
        </div>
        <button 
          className={styles.clearLogsButton} 
          onClick={() => setLogs([])}
        >
          🗑️ Limpar Logs
        </button>
      </div>
    </div>
  );
};
