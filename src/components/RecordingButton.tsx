import { PermissionChecker } from '@/services/permissionChecker';
import { RecordingState } from '@/types';
import React, { useEffect, useState } from 'react';
import styles from './RecordingButton.module.css';

interface RecordingButtonProps {
  recordingState: RecordingState;
  currentTranscription: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
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

  const checkSupport = () => {
    addLog('🔍 Verificando suporte ao Speech Recognition...', logs, setLogs);
    const hasWebkit = !!(window as any).webkitSpeechRecognition;
    const hasStandard = !!(window as any).SpeechRecognition;
    addLog(`webkitSpeechRecognition: ${hasWebkit}`, logs, setLogs);
    addLog(`SpeechRecognition: ${hasStandard}`, logs, setLogs);
    const supported = hasWebkit || hasStandard;
    setIsSupported(supported);
    addLog(supported ? '✅ Speech Recognition suportado!' : '❌ Speech Recognition NÃO suportado', logs, setLogs);
  };

  // Verificar suporte automaticamente ao montar o componente
  useEffect(() => {
    checkSupport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Adicionar log quando a transcrição mudar
  useEffect(() => {
    if (currentTranscription) {
      addLog(`📝 Transcrição recebida: "${currentTranscription}"`, logs, setLogs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTranscription]);

  // Adicionar log quando o estado de gravação mudar
  useEffect(() => {
    if (recordingState.isRecording) {
      addLog('🔴 Gravação ATIVA', logs, setLogs);
    } else if (recordingState.isProcessing) {
      addLog('⏳ Processando...', logs, setLogs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingState.isRecording, recordingState.isProcessing]);

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
    
    if (!recordingState.isRecording) {
      // Usar o sistema principal do useApp em vez do sistema local
      addLog('🎤 Iniciando gravação...', logs, setLogs);
      if (onStartRecording) {
        onStartRecording();
      }
    } else {
      // Usar o sistema principal do useApp em vez do sistema local
      addLog('⏹️ Parando gravação...', logs, setLogs);
      if (onStopRecording) {
        onStopRecording();
      }
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
    if (recordingState.isRecording) {
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
    if (recordingState.isRecording) {
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
            recordingState.isRecording ? styles.recording : ''
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
        <p>Gravando: <span className={recordingState.isRecording ? styles.listening : styles.notListening}>
          {recordingState.isRecording ? '🟢 Sim' : '🔴 Não'}
        </span></p>
        <p>Transcrição: <span className={styles.currentTranscript}>
          {currentTranscription || 'N/A'}
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
