import { PermissionChecker } from '@/services/permissionChecker';
import { RecordingState } from '@/types';
import React from 'react';
import styles from './RecordingButton.module.css';

interface RecordingButtonProps {
  recordingState: RecordingState;
  currentTranscription: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  permissionsGranted?: boolean;
}

export const RecordingButton: React.FC<RecordingButtonProps> = ({
  recordingState,
  currentTranscription,
  onStartRecording,
  onStopRecording,
  permissionsGranted = true
}) => {
  const handleClick = () => {
    if (!permissionsGranted) {
      // Se não tem permissão, solicitar imediatamente
      requestMicrophonePermission();
      return;
    }
    
    if (!recordingState.isRecording && !recordingState.isProcessing) {
      onStartRecording();
    } else if (recordingState.isRecording) {
      onStopRecording();
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
      } else {
        console.log('Microphone permission denied via button');
        alert('Permissão de microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador.');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de microfone:', error);
      alert('Erro ao solicitar permissão de microfone. Tente novamente.');
    }
  };

  const handleMouseUp = () => {
    if (recordingState.isRecording) {
      onStopRecording();
    }
  };

  const getButtonText = () => {
    if (!permissionsGranted) {
      return '🎤 Permitir Microfone';
    }
    if (recordingState.isProcessing) {
      return '⏳ Processando...';
    }
    if (recordingState.isRecording) {
      return '🔴 Parar Gravação';
    }
    return '🎤 Gravar Gasto/Ganho';
  };

  const getInstructionText = () => {
    if (!permissionsGranted) {
      return 'Clique no botão para permitir o acesso ao microfone';
    }
    if (recordingState.isRecording) {
      return 'Fale seu gasto ou ganho. Ex: "Gastei 25 reais no almoço"';
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
      
      {/* Exibir transcrição sempre que estiver gravando ou houver transcrição */}
      {(recordingState.isRecording || currentTranscription) && (
        <div className={styles.transcriptionContainer}>
          <p className={styles.transcriptionLabel}>
            {recordingState.isRecording ? '🎤 Escutando...' : '📝 Transcrição:'}
          </p>
          <p className={styles.transcriptionText}>
            {currentTranscription || (recordingState.isRecording ? 'Fale seu gasto ou ganho...' : 'Processando...')}
          </p>
        </div>
      )}
    </div>
  );
};
