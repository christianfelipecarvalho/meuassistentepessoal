import React, { useState, useEffect, useMemo } from 'react';
import { SpeechTranscriber } from '@/services/audioService';
import styles from './TranscriptionDebug.module.css';

interface TranscriptionDebugProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TranscriptionDebug: React.FC<TranscriptionDebugProps> = ({ isVisible, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  
  const transcriber = useMemo(() => new SpeechTranscriber(), []);

  useEffect(() => {
    setIsSupported(transcriber.isTranscriptionSupported());
  }, [transcriber]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const startTest = () => {
    if (!isSupported) {
      addLog('❌ Speech Recognition não suportado');
      return;
    }

    setIsRecording(true);
    setTranscription('');
    setLogs([]);
    
    addLog('🎤 Iniciando teste de transcrição...');
    
    transcriber.startRealTimeTranscription(
      (text: string) => {
        setTranscription(text);
        addLog(`📝 Transcrição: "${text}"`);
      },
      (error: Error) => {
        addLog(`❌ Erro: ${error.message}`);
        setIsRecording(false);
      }
    );
  };

  const stopTest = () => {
    transcriber.stopRealTimeTranscription();
    setIsRecording(false);
    addLog('⏹️ Teste finalizado');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>🎤 Debug de Transcrição</h2>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Status</h3>
            <div className={styles.status}>
              <p>Suporte: {isSupported ? '✅ Suportado' : '❌ Não suportado'}</p>
              <p>Estado: {isRecording ? '🔴 Gravando' : '⏹️ Parado'}</p>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Transcrição Atual</h3>
            <div className={styles.transcription}>
              {transcription || 'Nenhuma transcrição ainda...'}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Controles</h3>
            <div className={styles.controls}>
              <button 
                onClick={startTest} 
                disabled={isRecording || !isSupported}
                className={styles.startButton}
              >
                {isRecording ? '🔴 Gravando...' : '🎤 Iniciar Teste'}
              </button>
              <button 
                onClick={stopTest} 
                disabled={!isRecording}
                className={styles.stopButton}
              >
                ⏹️ Parar
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Logs</h3>
            <div className={styles.logs}>
              {logs.length === 0 ? (
                <p>Nenhum log ainda...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={styles.logEntry}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Instruções</h3>
            <div className={styles.instructions}>
              <p>1. Clique em &quot;Iniciar Teste&quot;</p>
              <p>2. Fale algo como &quot;gastei 25 reais no almoço&quot;</p>
              <p>3. Veja a transcrição aparecer em tempo real</p>
              <p>4. Clique em &quot;Parar&quot; quando terminar</p>
              <p>5. Verifique os logs para debug</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
