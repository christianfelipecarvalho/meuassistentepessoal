import React, { useEffect, useState } from 'react';
import styles from './PermissionsManager.module.css';
import { PWAInstructions } from './PWAInstructions';

interface PermissionsManagerProps {
  onPermissionsGranted: () => void;
  onPermissionsDenied: () => void;
}

interface PermissionState {
  microphone: 'granted' | 'denied' | 'prompt' | 'checking';
  storage: 'granted' | 'denied' | 'prompt' | 'checking';
}

export const PermissionsManager: React.FC<PermissionsManagerProps> = ({
  onPermissionsGranted,
  onPermissionsDenied
}) => {
  const [permissions, setPermissions] = useState<PermissionState>({
    microphone: 'checking',
    storage: 'checking'
  });
  const [isChecking, setIsChecking] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const [showPWAInstructions, setShowPWAInstructions] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detectar se é dispositivo móvel
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);
    
    // Detectar se é PWA instalado
    const pwa = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true;
    setIsPWA(pwa);
    
    checkPermissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkPermissions = async () => {
    try {
      // Verificar permissão de microfone
      const micPermission = await checkMicrophonePermission();
      
      // Verificar permissão de armazenamento (IndexedDB)
      const storagePermission = await checkStoragePermission();

      setPermissions({
        microphone: micPermission,
        storage: storagePermission
      });

      setIsChecking(false);

      // Se alguma permissão não foi concedida, mostrar prompt
      if (micPermission !== 'granted' || storagePermission !== 'granted') {
        setShowPrompt(true);
        // Se for mobile e microfone não concedido, mostrar instruções
        if (isMobile && micPermission !== 'granted') {
          setShowMobileInstructions(true);
        }
      } else {
        onPermissionsGranted();
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setIsChecking(false);
      setShowPrompt(true);
      if (isMobile) {
        setShowMobileInstructions(true);
      }
    }
  };


  const checkMicrophonePermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
    try {
      if (!navigator.permissions) {
        return 'prompt';
      }

      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch (error) {
      console.error('Erro ao verificar permissão de microfone:', error);
      return 'prompt';
    }
  };

  const checkStoragePermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
    try {
      // Testar se IndexedDB está disponível
      if (!window.indexedDB) {
        return 'denied';
      }

      // Tentar abrir um banco de dados de teste
      return new Promise((resolve) => {
        const request = indexedDB.open('permission-test', 1);
        
        request.onsuccess = () => {
          const db = request.result as IDBDatabase;
          db.close();
          indexedDB.deleteDatabase('permission-test');
          resolve('granted');
        };
        
        request.onerror = () => {
          resolve('denied');
        };
        
        request.onblocked = () => {
          resolve('denied');
        };
      });
    } catch (error) {
      console.error('Erro ao verificar permissão de armazenamento:', error);
      return 'denied';
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      setPermissions(prev => ({ ...prev, microphone: 'checking' }));
      
      // Solicitar acesso ao microfone com configurações específicas para mobile
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Parar o stream imediatamente
      stream.getTracks().forEach(track => track.stop());
      
      setPermissions(prev => ({ ...prev, microphone: 'granted' }));
      setShowMobileInstructions(false);
      
      // Verificar se todas as permissões foram concedidas
      if (permissions.storage === 'granted') {
        onPermissionsGranted();
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de microfone:', error);
      setPermissions(prev => ({ ...prev, microphone: 'denied' }));
      
      // Se for mobile e erro específico, mostrar instruções
      if (isMobile) {
        setShowMobileInstructions(true);
      }
    }
  };

  const requestStoragePermission = async () => {
    try {
      setPermissions(prev => ({ ...prev, storage: 'checking' }));
      
      // Testar criação de dados no IndexedDB
      const testData = { test: 'permission-check', timestamp: Date.now() };
      
      // Tentar salvar dados de teste
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('permission-test-storage', 1);
        
        request.onupgradeneeded = () => {
          const store = request.result.createObjectStore('test', { keyPath: 'id' });
        };
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const transaction = db.transaction(['test'], 'readwrite');
      const store = transaction.objectStore('test');
      
      await new Promise((resolve, reject) => {
        const request = store.add({ ...testData, id: 1 });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      // Limpar dados de teste
      await new Promise((resolve, reject) => {
        const request = store.delete(1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      db.close();
      indexedDB.deleteDatabase('permission-test-storage');
      
      setPermissions(prev => ({ ...prev, storage: 'granted' }));
      
      // Verificar se todas as permissões foram concedidas
      if (permissions.microphone === 'granted') {
        onPermissionsGranted();
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de armazenamento:', error);
      setPermissions(prev => ({ ...prev, storage: 'denied' }));
    }
  };

  const handleSkip = () => {
    setShowPrompt(false);
    onPermissionsDenied();
  };

  if (isChecking) {
    return (
      <div className={styles.permissionsContainer}>
        <div className={styles.checkingPermissions}>
          <div className={styles.spinner}></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className={styles.permissionsContainer}>
      <div className={styles.permissionsModal}>
        <div className={styles.header}>
          <h2>🔐 Permissões Necessárias</h2>
          <p>Para funcionar corretamente, o app precisa de algumas permissões:</p>
        </div>

        <div className={styles.permissionsList}>
          <div className={styles.permissionItem}>
            <div className={styles.permissionIcon}>
              {permissions.microphone === 'granted' ? '✅' : '🎤'}
            </div>
            <div className={styles.permissionInfo}>
              <h3>Microfone</h3>
              <p>Para gravar áudio das suas transações</p>
              {permissions.microphone === 'granted' ? (
                <span className={styles.granted}>✓ Concedida</span>
              ) : (
                <button 
                  className={styles.requestButton}
                  onClick={requestMicrophonePermission}
                  disabled={permissions.microphone === 'checking'}
                >
                  {permissions.microphone === 'checking' ? 'Verificando...' : 'Conceder'}
                </button>
              )}
            </div>
          </div>

          {showMobileInstructions && (
            <div className={styles.mobileInstructions}>
              <div className={styles.instructionHeader}>
                <h4>📱 Instruções para Celular:</h4>
              </div>
              <div className={styles.instructionSteps}>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>1</span>
                  <p>Clique em <strong>&quot;Conceder&quot;</strong> acima</p>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>2</span>
                  <p>Aparecerá um popup do navegador</p>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>3</span>
                  <p>Clique em <strong>&quot;Permitir&quot;</strong> no popup</p>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>4</span>
                  <p>Se não aparecer o popup, procure o ícone de microfone na barra de endereços</p>
                </div>
              </div>
              <div className={styles.instructionNote}>
                <p>💡 <strong>Dica:</strong> Se você instalou o app como PWA, pode ser necessário ir nas configurações do navegador para liberar as permissões.</p>
                {isPWA && (
                  <button 
                    className={styles.pwaInstructionsButton}
                    onClick={() => setShowPWAInstructions(true)}
                  >
                    📱 Ver Instruções para PWA
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={styles.permissionItem}>
            <div className={styles.permissionIcon}>
              {permissions.storage === 'granted' ? '✅' : '💾'}
            </div>
            <div className={styles.permissionInfo}>
              <h3>Armazenamento</h3>
              <p>Para salvar suas transações localmente</p>
              {permissions.storage === 'granted' ? (
                <span className={styles.granted}>✓ Concedida</span>
              ) : (
                <button 
                  className={styles.requestButton}
                  onClick={requestStoragePermission}
                  disabled={permissions.storage === 'checking'}
                >
                  {permissions.storage === 'checking' ? 'Verificando...' : 'Conceder'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.skipButton} onClick={handleSkip}>
            Pular por enquanto
          </button>
          <button 
            className={styles.continueButton}
            onClick={onPermissionsGranted}
            disabled={permissions.microphone !== 'granted' || permissions.storage !== 'granted'}
          >
            Continuar
          </button>
        </div>

        <div className={styles.footer}>
          <p>💡 Você pode conceder essas permissões depois nas configurações do navegador</p>
        </div>
      </div>

      <PWAInstructions
        isOpen={showPWAInstructions}
        onClose={() => setShowPWAInstructions(false)}
      />
    </div>
  );
};
