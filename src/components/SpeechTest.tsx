import React, { useState } from 'react';
import styles from './SpeechTest.module.css';

export const SpeechTest: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [recognition, setRecognition] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
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
      if (!recognition) {
        addLog('🔧 Criando instância do Speech Recognition...');
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const newRecognition = new SpeechRecognition();
        
        newRecognition.continuous = true;
        newRecognition.interimResults = true;
        newRecognition.lang = 'pt-BR';
        
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
    if (!isSupported || !recognition) {
      addLog('❌ Speech Recognition não suportado ou não inicializado');
      return;
    }

    if (isListening) {
      addLog('⚠️ Já está escutando, ignorando...');
      return;
    }

    addLog('🎤 Iniciando escuta...');
    
    addLog('⚙️ Configurações aplicadas');
    addLog(`Idioma: ${recognition.lang}`);
    addLog(`Contínuo: ${recognition.continuous}`);
    addLog(`Resultados interim: ${recognition.interimResults}`);

    recognition.onstart = () => {
      addLog('✅ Escuta iniciada');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
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
      }
      
      if (interimTranscript) {
        addLog(`🔄 Interim: "${interimTranscript}"`);
      }
    };

    recognition.onerror = (event: any) => {
      addLog(`❌ Erro: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      addLog('⏹️ Escuta finalizada');
      setIsListening(false);
    };

    try {
      recognition.start();
      addLog('🚀 recognition.start() chamado');
    } catch (error) {
      addLog(`❌ Erro ao iniciar: ${error}`);
    }
  };

  const stopListening = () => {
    addLog('⏹️ Parando escuta...');
    
    if (recognition && isListening) {
      try {
        recognition.stop();
        addLog('✅ Escuta parada');
      } catch (error) {
        addLog(`❌ Erro ao parar: ${error}`);
      }
    } else {
      addLog('⚠️ Nenhuma escuta ativa');
    }
    
    setIsListening(false);
  };

  return (
    <div className={styles.container}>
      <h2>🎤 Teste Simples de Speech Recognition</h2>
      
      <div className={styles.controls}>
        <button onClick={checkSupport} className={styles.button}>
          🔍 Verificar Suporte
        </button>
        <button 
          onClick={startListening} 
          disabled={!isSupported || isListening}
          className={styles.button}
        >
          {isListening ? '🔴 Escutando...' : '🎤 Iniciar Escuta'}
        </button>
        <button 
          onClick={stopListening} 
          disabled={!isListening}
          className={styles.button}
        >
          ⏹️ Parar
        </button>
      </div>

      <div className={styles.status}>
        <p>Suporte: {isSupported ? '✅ Sim' : '❌ Não'}</p>
        <p>Estado: {isListening ? '🔴 Escutando' : '⏹️ Parado'}</p>
      </div>

      <div className={styles.transcript}>
        <h3>Transcrição:</h3>
        <div className={styles.transcriptText}>
          {transcript || 'Nenhuma transcrição ainda...'}
        </div>
      </div>

      <div className={styles.logs}>
        <h3>Logs:</h3>
        <div className={styles.logContainer}>
          {logs.map((log, index) => (
            <div key={index} className={styles.logEntry}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
