// Enums e constantes seguindo Single Responsibility Principle

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum ViewType {
  RECORD = 'record',
  LIST = 'list'
}

export enum RecordingState {
  IDLE = 'idle',
  RECORDING = 'recording',
  PROCESSING = 'processing'
}

export enum ConnectionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

export enum AudioProcessingStatus {
  PENDING = 0,
  PROCESSED = 1
}

// Constantes de validação
export const VALIDATION_RULES = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999.99,
  MIN_DESCRIPTION_LENGTH: 1,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_CATEGORY_LENGTH: 1,
  MAX_CATEGORY_LENGTH: 50
} as const;

// Constantes de UI
export const UI_CONSTANTS = {
  BREAKPOINTS: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024
  },
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 3000
} as const;

// Constantes de erro
export const ERROR_MESSAGES = {
  MICROPHONE_ACCESS_DENIED: 'Acesso ao microfone negado',
  AUDIO_RECORDING_FAILED: 'Falha na gravação de áudio',
  TRANSCRIPTION_NOT_SUPPORTED: 'Transcrição não suportada neste navegador',
  TRANSACTION_VALIDATION_FAILED: 'Dados da transação inválidos',
  CATEGORY_NOT_FOUND: 'Categoria não encontrada',
  DATABASE_ERROR: 'Erro no banco de dados',
  NETWORK_ERROR: 'Erro de conexão',
  PERMISSION_DENIED: 'Permissão negada'
} as const;

// Constantes de sucesso
export const SUCCESS_MESSAGES = {
  TRANSACTION_SAVED: 'Transação salva com sucesso',
  AUDIO_PROCESSED: 'Áudio processado com sucesso',
  CATEGORY_CREATED: 'Categoria criada com sucesso',
  DATA_SYNCED: 'Dados sincronizados com sucesso'
} as const;

// Constantes de formatação
export const FORMAT_CONSTANTS = {
  CURRENCY_LOCALE: 'pt-BR',
  CURRENCY_CODE: 'BRL',
  DATE_LOCALE: 'pt-BR',
  DATE_FORMAT: {
    SHORT: 'dd/MM/yyyy',
    LONG: 'dd/MM/yyyy HH:mm',
    TIME_ONLY: 'HH:mm'
  }
} as const;

// Constantes de armazenamento
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  AUDIO_SETTINGS: 'audioSettings',
  THEME_PREFERENCES: 'themePreferences',
  LAST_SYNC: 'lastSync'
} as const;

// Constantes de API (para futuras integrações)
export const API_CONSTANTS = {
  ENDPOINTS: {
    TRANSCRIPTION: '/api/transcription',
    CATEGORIES: '/api/categories',
    TRANSACTIONS: '/api/transactions'
  },
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
} as const;
