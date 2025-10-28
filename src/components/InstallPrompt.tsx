'use client';

import { useEffect, useState } from 'react';
import styles from './InstallPrompt.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const hasNavigatorStandalone = (window.navigator as any).standalone === true;
      
      if (isStandalone || hasNavigatorStandalone) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Verificar se é iOS
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIpad = /ipad/.test(userAgent) || 
                     (/iphone|ipod/.test(userAgent) && !(window as any).MSStream);
      
      if (isIpad) {
        setIsIOS(true);
      }
    };

    checkIOS();
    
    if (checkIfInstalled()) {
      return;
    }

    // Verificar se já mostrou o prompt
    const installPromptShown = localStorage.getItem('install-prompt-shown');
    const installPromptDismissedTime = localStorage.getItem('install-prompt-dismissed');
    
    // Só mostrar se não mostrou ainda ou se passou mais de 7 dias desde a última vez
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const shouldShow = !installPromptShown || 
                      (installPromptDismissedTime && 
                       Date.now() - parseInt(installPromptDismissedTime) > sevenDaysInMs);

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      
      // Mostrar o prompt apenas se passar as verificações
      if (shouldShow) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 1500); // Aguardar 1.5s para uma UX melhor
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Chamar o prompt nativo
      await deferredPrompt.prompt();
      
      // Aguardar a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // Marcar como mostrado e instalado
        localStorage.setItem('install-prompt-shown', 'true');
        localStorage.setItem('install-prompt-accepted', 'true');
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Erro ao instalar:', error);
    }
    
    setDeferredPrompt(null);
  };

  const handleNotNow = () => {
    localStorage.setItem('install-prompt-shown', 'true');
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  // Não mostrar se já está instalado
  if (isInstalled) {
    return null;
  }

  // Não mostrar se não está pronto
  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className={styles.installPrompt}>
      <div className={styles.installPromptContent}>
        <button
          className={styles.closeButton}
          onClick={handleDismiss}
          aria-label="Fechar"
        >
          <span>✕</span>
        </button>

        <div className={styles.iconContainer}>
          <span className={styles.icon}>📱</span>
        </div>

        <h3 className={styles.title}>Instale o App!</h3>
        <p className={styles.description}>
          Acesso rápido, funcionalidades offline e muito mais!
        </p>

        <div className={styles.buttons}>
          <button
            className={styles.installButton}
            onClick={handleInstallClick}
          >
            ⬇️ Instalar Agora
          </button>
          <button
            className={styles.notNowButton}
            onClick={handleNotNow}
          >
            Agora Não
          </button>
        </div>
      </div>
    </div>
  );
}

