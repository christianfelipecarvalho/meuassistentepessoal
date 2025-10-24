import React, { useState } from 'react';
import styles from './SimplePermissions.module.css';

interface SimplePermissionsProps {
  onPermissionsGranted: () => void;
  onPermissionsDenied: () => void;
}

export const SimplePermissions: React.FC<SimplePermissionsProps> = ({
  onPermissionsGranted,
  onPermissionsDenied
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestAllPermissions = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      // Solicitar permissão de microfone diretamente
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      // Parar o stream imediatamente
      stream.getTracks().forEach(track => track.stop());

      // Testar armazenamento (IndexedDB)
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        // Tentar criar um banco de dados de teste
        const testDb = await new Promise((resolve, reject) => {
          const request = indexedDB.open('permission-test', 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        if (testDb) {
          (testDb as IDBDatabase).close();
          indexedDB.deleteDatabase('permission-test');
        }
      }

      // Se chegou até aqui, todas as permissões foram concedidas
      onPermissionsGranted();
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      
      // Determinar tipo de erro
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Permissão negada. Clique no ícone de microfone na barra de endereços e permita o acesso.');
        } else if (error.name === 'NotFoundError') {
          setError('Microfone não encontrado. Verifique se há um microfone conectado.');
        } else {
          setError('Erro ao acessar microfone. Tente novamente.');
        }
      } else {
        setError('Erro desconhecido. Tente novamente.');
      }
      
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    onPermissionsDenied();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.icon}>🎤</div>
          <h2>Permissões Necessárias</h2>
          <p>Para gravar suas transações financeiras, precisamos acessar seu microfone.</p>
        </div>

        <div className={styles.content}>
          {error && (
            <div className={styles.errorBox}>
              <div className={styles.errorIcon}>⚠️</div>
              <p>{error}</p>
            </div>
          )}

          <div className={styles.permissionsList}>
            <div className={styles.permissionItem}>
              <span className={styles.permissionIcon}>🎤</span>
              <div className={styles.permissionInfo}>
                <h3>Microfone</h3>
                <p>Para gravar áudio das suas transações</p>
              </div>
            </div>
            
            <div className={styles.permissionItem}>
              <span className={styles.permissionIcon}>💾</span>
              <div className={styles.permissionInfo}>
                <h3>Armazenamento</h3>
                <p>Para salvar suas transações no dispositivo</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.skipButton}
            onClick={handleSkip}
            disabled={isRequesting}
          >
            Pular por enquanto
          </button>
          
          <button 
            className={styles.allowButton}
            onClick={requestAllPermissions}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <>
                <span className={styles.spinner}></span>
                Solicitando...
              </>
            ) : (
              'Permitir Tudo'
            )}
          </button>
        </div>

        <div className={styles.footer}>
          <p>💡 <strong>Dica:</strong> Se aparecer um popup do navegador, clique em &quot;Permitir&quot;</p>
        </div>
      </div>
    </div>
  );
};
