export interface Transaction {
  id?: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  audioBlob?: Blob;
}

export interface Category {
  id?: number;
  name: string;
  color: string;
  icon: string;
}

export interface AudioQueueItem {
  id?: number;
  audioBlob: Blob;
  timestamp: Date;
  processed: number;
}

export interface ParsedTransaction {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export interface RecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  hasPermission: boolean;
}

export interface AppState {
  isOnline: boolean;
  transactions: Transaction[];
  categories: Category[];
  recordingState: RecordingState;
}

// Novos tipos para validação e formatação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormattedTransaction extends Transaction {
  formattedAmount: string;
  formattedDate: string;
  relativeDate: string;
}

export interface CategorySummary {
  category: Category;
  transactions: Transaction[];
  totalAmount: number;
  formattedTotal: string;
  percentage: number;
}

export interface MonthlySummary {
  month: string;
  year: number;
  income: number;
  expense: number;
  balance: number;
  formattedIncome: string;
  formattedExpense: string;
  formattedBalance: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  locale: string;
  audioSettings: {
    sampleRate: number;
    echoCancellation: boolean;
    noiseSuppression: boolean;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
}

export interface UserPreferences {
  defaultCategory: string;
  autoCategorize: boolean;
  saveAudioFiles: boolean;
  syncEnabled: boolean;
  backupEnabled: boolean;
}
