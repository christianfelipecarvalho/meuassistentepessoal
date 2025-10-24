import { AudioQueueItem, Category, ParsedTransaction, Transaction } from '@/types';

// Interfaces seguindo o princípio da Inversão de Dependência (DIP)
export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  add(transaction: Omit<Transaction, 'id'>): Promise<number>;
  update(id: number, changes: Partial<Transaction>): Promise<number>;
  delete(id: number): Promise<void>;
  getByCategory(category: string): Promise<Transaction[]>;
  getByType(type: 'income' | 'expense'): Promise<Transaction[]>;
}

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  add(category: Omit<Category, 'id'>): Promise<number>;
  update(id: number, changes: Partial<Category>): Promise<number>;
  delete(id: number): Promise<void>;
}

export interface IAudioQueueRepository {
  add(audioItem: Omit<AudioQueueItem, 'id'>): Promise<number>;
  getPending(): Promise<AudioQueueItem[]>;
  markAsProcessed(id: number): Promise<number>;
  clearProcessed(): Promise<void>;
}

export interface IAudioRecorder {
  startRecording(): Promise<boolean>;
  stopRecording(): Promise<Blob>;
  getRecordingState(): boolean;
  checkMicrophonePermission(): Promise<boolean>;
}

export interface ISpeechTranscriber {
  transcribeAudio(audioBlob: Blob): Promise<string>;
  parseTransaction(text: string): ParsedTransaction;
  isTranscriptionSupported(): boolean;
  startRealTimeTranscription(onResult: (text: string) => void, onError: (error: Error) => void): void;
  stopRealTimeTranscription(): void;
}

export interface ITransactionService {
  getAllTransactions(): Promise<Transaction[]>;
  addTransaction(transaction: Omit<Transaction, 'id'>): Promise<number>;
  updateTransaction(id: number, changes: Partial<Transaction>): Promise<number>;
  deleteTransaction(id: number): Promise<void>;
  getTransactionsByCategory(category: string): Promise<Transaction[]>;
  getTransactionsByType(type: 'income' | 'expense'): Promise<Transaction[]>;
  calculateTotalByType(type: 'income' | 'expense'): Promise<number>;
}

export interface ICategoryService {
  getAllCategories(): Promise<Category[]>;
  initializeDefaultCategories(): Promise<void>;
}

export interface IOfflineService {
  processOfflineAudio(): Promise<void>;
  addToQueue(audioBlob: Blob): Promise<void>;
}

// Interfaces para validação e formatação
export interface IValidator<T> {
  validate(data: T): ValidationResult;
}

export interface IFormatter {
  formatCurrency(amount: number): string;
  formatDate(date: Date): string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Interfaces para eventos e notificações
export interface IEventPublisher {
  publish(event: DomainEvent): void;
}

export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface DomainEvent {
  type: string;
  timestamp: Date;
  data: any;
}

// Interfaces para configuração
export interface IAppConfig {
  databaseName: string;
  defaultCategories: Omit<Category, 'id'>[];
  audioSettings: {
    sampleRate: number;
    echoCancellation: boolean;
    noiseSuppression: boolean;
  };
}

// Re-export dos tipos existentes
export type { AudioQueueItem, Category, ParsedTransaction, RecordingState, Transaction } from '@/types';
