export class PermissionChecker {
  private static instance: PermissionChecker;
  
  static getInstance(): PermissionChecker {
    if (!PermissionChecker.instance) {
      PermissionChecker.instance = new PermissionChecker();
    }
    return PermissionChecker.instance;
  }

  /**
   * Verifica o estado real das permissões de microfone
   * Retorna: 'granted' | 'denied' | 'prompt' | 'unknown'
   */
  async checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
    if (typeof window === 'undefined') {
      return 'unknown';
    }

    try {
      // Método 1: Usar Permissions API se disponível
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('Permissions API result:', result.state);
          return result.state as 'granted' | 'denied' | 'prompt';
        } catch (error) {
          console.log('Permissions API not supported or failed:', error);
        }
      }

      // Método 2: Tentar getUserMedia para testar permissão real
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        });
        
        // Se chegou até aqui, permissão foi concedida
        stream.getTracks().forEach(track => track.stop());
        console.log('getUserMedia test: granted');
        return 'granted';
      } catch (error: any) {
        console.log('getUserMedia test failed:', error.name, error.message);
        
        if (error.name === 'NotAllowedError') {
          return 'denied';
        } else if (error.name === 'NotFoundError') {
          return 'denied';
        } else {
          return 'prompt';
        }
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return 'unknown';
    }
  }

  /**
   * Força a solicitação de permissão de microfone
   * Retorna true se conseguiu solicitar, false caso contrário
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
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
      
      console.log('Microphone permission granted successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to request microphone permission:', error);
      
      if (error.name === 'NotAllowedError') {
        console.log('Permission denied by user');
      } else if (error.name === 'NotFoundError') {
        console.log('No microphone found');
      }
      
      return false;
    }
  }

  /**
   * Verifica se o navegador suporta getUserMedia
   */
  isGetUserMediaSupported(): boolean {
    return typeof window !== 'undefined' && 
           !!navigator.mediaDevices && 
           typeof navigator.mediaDevices.getUserMedia === 'function';
  }

  /**
   * Verifica se o navegador suporta Permissions API
   */
  isPermissionsAPISupported(): boolean {
    return typeof window !== 'undefined' && 
           navigator.permissions && 
           typeof navigator.permissions.query === 'function';
  }

  /**
   * Detecta se está rodando em ambiente local (localhost) ou deploy
   */
  isLocalEnvironment(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.') ||
           hostname.startsWith('172.');
  }

  /**
   * Detecta se está rodando em HTTPS
   */
  isSecureContext(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.isSecureContext || window.location.protocol === 'https:';
  }

  /**
   * Obtém informações detalhadas sobre o contexto de execução
   */
  getContextInfo(): {
    isLocal: boolean;
    isSecure: boolean;
    protocol: string;
    hostname: string;
    port: string;
    fullUrl: string;
    needsHttps: boolean;
  } {
    if (typeof window === 'undefined') {
      return {
        isLocal: false,
        isSecure: false,
        protocol: '',
        hostname: '',
        port: '',
        fullUrl: '',
        needsHttps: false
      };
    }

    const isLocal = this.isLocalEnvironment();
    const isSecure = this.isSecureContext();
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const fullUrl = window.location.href;
    const needsHttps = !isSecure && !isLocal;

    return {
      isLocal,
      isSecure,
      protocol,
      hostname,
      port,
      fullUrl,
      needsHttps
    };
  }

  /**
   * Obtém informações detalhadas sobre o estado das permissões
   */
  async getPermissionInfo(): Promise<{
    microphone: 'granted' | 'denied' | 'prompt' | 'unknown';
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
  }> {
    const microphone = await this.checkMicrophonePermission();
    const getUserMediaSupported = this.isGetUserMediaSupported();
    const permissionsAPISupported = this.isPermissionsAPISupported();
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const context = this.getContextInfo();

    return {
      microphone,
      getUserMediaSupported,
      permissionsAPISupported,
      userAgent,
      isMobile,
      context
    };
  }
}
