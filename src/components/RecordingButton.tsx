import { PermissionChecker } from '@/services/permissionChecker';
import { RecordingState } from '@/types';
import React, { useState, useRef } from 'react';
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
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[RECORDING BUTTON] ${message}`);
  };

  const checkSupport = () => {
    addLog('🔍 Verificando suporte ao Speech Recognition...');
    
    const hasWebkit = !!(window as any).webkitSpeechRecognition;
    const hasStandard = !!(window as any).SpeechRecognition;
    
    addLog(`webkitSpeechRecognition: ${hasWebkit}`);
    addLog(`SpeechRecognition: ${hasStandard}`);
    
    const supported = hasWebkit || hasStandard;
    setIsSupported(supported);
    
    if (supported) {
      addLog('✅ Speech Recognition suportado!');
      
      // Criar instância única
      if (!recognitionRef.current) {
        addLog('🔧 Criando instância do Speech Recognition...');
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const newRecognition = new SpeechRecognition();
        
        newRecognition.continuous = true;
        newRecognition.interimResults = true;
        newRecognition.lang = 'pt-BR';
        
        recognitionRef.current = newRecognition;
        setRecognition(newRecognition);
        addLog('✅ Instância criada e configurada');
      } else {
        addLog('⚠️ Instância já existe, reutilizando...');
      }
    } else {
      addLog('❌ Speech Recognition NÃO suportado');
    }
  };

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      addLog('❌ Speech Recognition não suportado ou não inicializado');
      return;
    }

    if (isListening) {
      addLog('⚠️ Já está escutando, ignorando...');
      return;
    }

    addLog('🎤 Iniciando escuta...');
    
    addLog('⚙️ Configurações aplicadas');
    addLog(`Idioma: ${recognitionRef.current.lang}`);
    addLog(`Contínuo: ${recognitionRef.current.continuous}`);
    addLog(`Resultados interim: ${recognitionRef.current.interimResults}`);

    recognitionRef.current.onstart = () => {
      addLog('✅ Escuta iniciada');
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      addLog(`📝 Resultado recebido (${event.results.length} resultados)`);
      
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        addLog(`✅ Final: "${finalTranscript}"`);
        setTranscript(prev => prev + finalTranscript + ' ');
        // Chamar callback do pai com a transcrição
        if (onStartRecording) {
          // Simular que está gravando
          onStartRecording();
        }
      }
      
      if (interimTranscript) {
        addLog(`🔄 Interim: "${interimTranscript}"`);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      addLog(`❌ Erro: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      addLog('⏹️ Escuta finalizada');
      setIsListening(false);
      // Chamar callback do pai para parar
      if (onStopRecording) {
        onStopRecording();
      }
    };

    try {
      recognitionRef.current.start();
      addLog('🚀 recognition.start() chamado');
    } catch (error) {
      addLog(`❌ Erro ao iniciar: ${error}`);
    }
  };

  const stopListening = () => {
    addLog('⏹️ Parando escuta...');
    
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        addLog('✅ Escuta parada');
      } catch (error) {
        addLog(`❌ Erro ao parar: ${error}`);
      }
    } else {
      addLog('⚠️ Nenhuma escuta ativa');
    }
    
    setIsListening(false);
  };

  const handleClick = () => {
    if (!permissionsGranted) {
      // Se não tem permissão, solicitar imediatamente
      requestMicrophonePermission();
      return;
    }
    
    // Verificar suporte primeiro
    if (!isSupported) {
      checkSupport();
      return;
    }
    
    if (!isListening) {
      startListening();
    } else {
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
          disabled={!permissionsGranted}
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
        <p>Escutando: <span className={isListening ? styles.listening : styles.notListening}>
          {isListening ? '🟢 Sim' : '🔴 Não'}
        </span></p>
        <p>Transcrição: <span className={styles.currentTranscript}>
          {transcript || 'N/A'}
        </span></p>
      </div>
      
      {/* Logs de debug */}
      <div className={styles.logsContainer}>
        <h4>Logs de Debug:</h4>
        {logs.slice(-5).map((log, index) => (
          <p key={index} className={styles.logItem}>{log}</p>
        ))}
      </div>
    </div>
  );
};
