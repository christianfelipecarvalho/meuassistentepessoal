/**
 * Sistema de logging condicional
 * Logs aparecem apenas em desenvolvimento ou quando debug mode está ativo
 * Seguindo Clean Code - evita poluição de logs em produção
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export class Logger {
  private context: string;
  private isDebugMode: boolean = false;

  constructor(context: string) {
    this.context = context;
    // Verificar se debug mode está ativo via localStorage (opcional)
    if (typeof window !== 'undefined') {
      this.isDebugMode = localStorage.getItem('debug_mode') === 'true';
    }
  }

  /**
   * Log de informação - apenas em desenvolvimento ou debug mode
   */
  info(message: string, ...args: any[]): void {
    if (isDevelopment || this.isDebugMode) {
      console.log(`[${this.context}] ℹ️ ${message}`, ...args);
    }
  }

  /**
   * Log de sucesso - apenas em desenvolvimento ou debug mode
   */
  success(message: string, ...args: any[]): void {
    if (isDevelopment || this.isDebugMode) {
      console.log(`[${this.context}] ✅ ${message}`, ...args);
    }
  }

  /**
   * Log de warning - sempre aparece
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.context}] ⚠️ ${message}`, ...args);
  }

  /**
   * Log de erro - sempre aparece
   */
  error(message: string, error?: Error | any, ...args: any[]): void {
    console.error(`[${this.context}] ❌ ${message}`, error, ...args);
  }

  /**
   * Log de debug - apenas em desenvolvimento ou debug mode
   */
  debug(message: string, ...args: any[]): void {
    if (isDevelopment || this.isDebugMode) {
      console.debug(`[${this.context}] 🔍 ${message}`, ...args);
    }
  }

  /**
   * Ativa o debug mode
   */
  enableDebugMode(): void {
    this.isDebugMode = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug_mode', 'true');
    }
  }

  /**
   * Desativa o debug mode
   */
  disableDebugMode(): void {
    this.isDebugMode = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('debug_mode');
    }
  }
}

/**
 * Factory para criar loggers com contexto
 */
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

