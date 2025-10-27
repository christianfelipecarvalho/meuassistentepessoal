/**
 * Configurações de debug mode
 * Centraliza configurações de desenvolvimento e debug
 */

export const DEBUG_CONFIG = {
  // Número de cliques necessários para ativar debug mode
  CLICK_COUNT_TO_ACTIVATE: 7,
  
  // Tempo máximo entre cliques (ms)
  CLICK_TIMEOUT: 1000,
  
  // Atalho de teclado para debug
  KEYBOARD_SHORTCUT: {
    ctrl: true,
    shift: true,
    key: 'D'
  },
  
  // LocalStorage key para persistir debug mode
  STORAGE_KEY: 'debug_mode',
  
  // Console prefix para logs de debug
  LOG_PREFIX: '🔧 [DEBUG]'
} as const;

/**
 * Verifica se está em modo de desenvolvimento
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Verifica se debug mode está ativo
 */
export const isDebugMode = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(DEBUG_CONFIG.STORAGE_KEY) === 'true';
};

/**
 * Ativa debug mode
 */
export const enableDebugMode = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEBUG_CONFIG.STORAGE_KEY, 'true');
    console.log(`${DEBUG_CONFIG.LOG_PREFIX} Modo debug ATIVADO`);
  }
};

/**
 * Desativa debug mode
 */
export const disableDebugMode = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEBUG_CONFIG.STORAGE_KEY);
    console.log(`${DEBUG_CONFIG.LOG_PREFIX} Modo debug DESATIVADO`);
  }
};

