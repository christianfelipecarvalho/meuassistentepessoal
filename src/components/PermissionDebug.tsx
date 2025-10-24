import { PermissionChecker } from '@/services/permissionChecker';
import React, { useEffect, useState } from 'react';
import styles from './PermissionDebug.module.css';

interface PermissionDebugProps {
  isVisible: boolean;
  onClose: () => void;
}

interface PermissionInfo {
  microphone: string;
  getUserMediaSupported: boolean;
  permissionsAPISupported: boolean;
  userAgent: string;
  isMobile: boolean;
  context: {
    isLocal: boolean;
    isSecure: boolean;
    protocol: string;
    hostname: string;
    port: string;
    fullUrl: string;
    needsHttps: boolean;
  };
}

export const PermissionDebug: React.FC<PermissionDebugProps> = ({
  isVisible,
  onClose
}) => {
  const [permissionInfo, setPermissionInfo] = useState<PermissionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshPermissionInfo = async () => {
    setIsLoading(true);
    try {
      const permissionChecker = PermissionChecker.getInstance();
      const info = await permissionChecker.getPermissionInfo();
      setPermissionInfo(info);
    } catch (error) {
      console.error('Error getting permission info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      refreshPermissionInfo();
    }
  }, [isVisible]);

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const permissionChecker = PermissionChecker.getInstance();
      const success = await permissionChecker.requestMicrophonePermission();
      
      if (success) {
        alert('Permissão concedida com sucesso!');
        window.dispatchEvent(new CustomEvent('microphonePermissionGranted'));
        onClose();
      } else {
        alert('Permissão negada. Verifique as configurações do navegador.');
      }
      
      // Atualizar informações
      await refreshPermissionInfo();
    } catch (error) {
      console.error('Error requesting permission:', error);
      alert('Erro ao solicitar permissão.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>🔍 Debug de Permissões</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Informações do Sistema</h3>
            {permissionInfo && (
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Microfone:</span>
                  <span className={`${styles.value} ${styles[permissionInfo.microphone]}`}>
                    {permissionInfo.microphone}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>getUserMedia:</span>
                  <span className={`${styles.value} ${permissionInfo.getUserMediaSupported ? styles.supported : styles.notSupported}`}>
                    {permissionInfo.getUserMediaSupported ? 'Suportado' : 'Não suportado'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Permissions API:</span>
                  <span className={`${styles.value} ${permissionInfo.permissionsAPISupported ? styles.supported : styles.notSupported}`}>
                    {permissionInfo.permissionsAPISupported ? 'Suportado' : 'Não suportado'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Mobile:</span>
                  <span className={`${styles.value} ${permissionInfo.isMobile ? styles.mobile : styles.desktop}`}>
                    {permissionInfo.isMobile ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h3>Contexto de Execução</h3>
            {permissionInfo && (
              <div className={styles.contextInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Ambiente:</span>
                  <span className={`${styles.value} ${permissionInfo.context.isLocal ? styles.local : styles.deployed}`}>
                    {permissionInfo.context.isLocal ? '🏠 Local' : '🌐 Deploy'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Protocolo:</span>
                  <span className={`${styles.value} ${permissionInfo.context.isSecure ? styles.secure : styles.insecure}`}>
                    {permissionInfo.context.protocol}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Host:</span>
                  <span className={styles.value}>{permissionInfo.context.hostname}:{permissionInfo.context.port}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>URL:</span>
                  <span className={styles.value}>{permissionInfo.context.fullUrl}</span>
                </div>
                {permissionInfo.context.needsHttps && (
                  <div className={styles.warning}>
                    ⚠️ HTTPS necessário para produção
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h3>Ações</h3>
            <div className={styles.actions}>
              <button 
                className={styles.refreshButton}
                onClick={refreshPermissionInfo}
                disabled={isLoading}
              >
                {isLoading ? 'Carregando...' : '🔄 Atualizar'}
              </button>
              
              <button 
                className={styles.requestButton}
                onClick={requestPermission}
                disabled={isLoading}
              >
                {isLoading ? 'Solicitando...' : '🎤 Solicitar Permissão'}
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Instruções</h3>
            <div className={styles.instructions}>
              {permissionInfo?.context.isLocal ? (
                <>
                  <h4>🏠 Ambiente Local</h4>
                  <p>• <strong>Chrome/Edge:</strong> Permissões funcionam normalmente</p>
                  <p>• <strong>Firefox:</strong> Pode precisar de configuração adicional</p>
                  <p>• <strong>Safari:</strong> Pode ter limitações</p>
                  <p>• <strong>Mobile:</strong> Alguns navegadores bloqueiam localhost</p>
                  <div className={styles.tip}>
                    💡 <strong>Dica:</strong> Para testar no celular, considere fazer deploy ou usar ngrok/tunnel
                  </div>
                </>
              ) : (
                <>
                  <h4>🌐 Ambiente Deploy</h4>
                  <p>• HTTPS é obrigatório para produção</p>
                  <p>• Permissões funcionam melhor em domínios confiáveis</p>
                  <p>• Mobile funciona normalmente</p>
                </>
              )}
              
              <h4>📱 Teste no Celular</h4>
              <p>1. Clique em &quot;Solicitar Microfone&quot;</p>
              <p>2. Se aparecer popup, clique em &quot;Permitir&quot;</p>
              <p>3. Se não funcionar, tente:</p>
              <p>   • Atualizar a página</p>
              <p>   • Limpar cache do navegador</p>
              <p>   • Verificar configurações do navegador</p>
              <p>   • Usar Chrome/Edge no mobile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
