import { CategoryEntity, TransactionEntity } from '@/domain';
import {
    Category,
    IAudioQueueRepository,
    ICategoryRepository,
    ICategoryService,
    IOfflineService,
    ITransactionRepository,
    ITransactionService,
    Transaction
} from '@/interfaces';
import { RepositoryFactory } from '@/repositories';

// Transaction Service seguindo Single Responsibility Principle
export class TransactionService implements ITransactionService {
  constructor(
    private transactionRepository: ITransactionRepository = RepositoryFactory.getTransactionRepository()
  ) {}

  async getAllTransactions(): Promise<Transaction[]> {
    return await this.transactionRepository.getAll();
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<number> {
    // Validação usando Domain Entity
    const transactionEntity = new TransactionEntity(
      undefined,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.description,
      transaction.date,
      transaction.audioBlob
    );

    return await this.transactionRepository.add(transactionEntity.toPlainObject());
  }

  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    return await this.transactionRepository.getByCategory(category);
  }

  async getTransactionsByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    return await this.transactionRepository.getByType(type);
  }

  async calculateTotalByType(type: 'income' | 'expense'): Promise<number> {
    const transactions = await this.transactionRepository.getByType(type);
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  async updateTransaction(id: number, changes: Partial<Transaction>): Promise<number> {
    return await this.transactionRepository.update(id, changes);
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.transactionRepository.delete(id);
  }

  async getTransactionEntities(): Promise<TransactionEntity[]> {
    const transactions = await this.getAllTransactions();
    return transactions.map(t => new TransactionEntity(
      t.id,
      t.amount,
      t.type,
      t.category,
      t.description,
      t.date,
      t.audioBlob
    ));
  }
}

// Category Service seguindo Single Responsibility Principle
export class CategoryService implements ICategoryService {
  constructor(
    private categoryRepository: ICategoryRepository = RepositoryFactory.getCategoryRepository()
  ) {}

  async getAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.getAll();
  }

  async initializeDefaultCategories(): Promise<void> {
    const existingCategories = await this.categoryRepository.getAll();
    
    if (existingCategories.length === 0) {
      const defaultCategories: Omit<Category, 'id'>[] = [
        { name: 'Alimentação', color: '#ef4444', icon: '🍽️' },
        { name: 'Transporte', color: '#06b6d4', icon: '🚗' },
        { name: 'Saúde', color: '#3b82f6', icon: '🏥' },
        { name: 'Educação', color: '#10b981', icon: '📚' },
        { name: 'Lazer', color: '#f59e0b', icon: '🎮' },
        { name: 'Casa', color: '#8b5cf6', icon: '🏠' },
        { name: 'Roupas', color: '#ec4899', icon: '👕' },
        { name: 'Tecnologia', color: '#6366f1', icon: '💻' },
        { name: 'Outros', color: '#6b7280', icon: '📦' }
      ];

      for (const categoryData of defaultCategories) {
        const categoryEntity = new CategoryEntity(
          undefined,
          categoryData.name,
          categoryData.color,
          categoryData.icon
        );
        await this.categoryRepository.add(categoryEntity.toPlainObject());
      }
    }
  }

  async getCategoryEntities(): Promise<CategoryEntity[]> {
    const categories = await this.getAllCategories();
    return categories.map(c => new CategoryEntity(
      c.id,
      c.name,
      c.color,
      c.icon
    ));
  }
}

// Offline Service seguindo Single Responsibility Principle
export class OfflineService implements IOfflineService {
  constructor(
    private audioQueueRepository: IAudioQueueRepository = RepositoryFactory.getAudioQueueRepository(),
    private transactionService: ITransactionService = new TransactionService()
  ) {}

  async processOfflineAudio(): Promise<void> {
    try {
      const pendingAudio = await this.audioQueueRepository.getPending();
      
      for (const audioItem of pendingAudio) {
        try {
          // Aqui você integraria com o serviço de transcrição
          // Por enquanto, vamos simular o processamento
          await this.processAudioItem(audioItem);
          await this.audioQueueRepository.markAsProcessed(audioItem.id!);
        } catch (error) {
          console.error('Error processing audio item:', error);
        }
      }
    } catch (error) {
      console.error('Error processing offline audio:', error);
      throw new Error('Failed to process offline audio');
    }
  }

  async addToQueue(audioBlob: Blob): Promise<void> {
    try {
      await this.audioQueueRepository.add({
        audioBlob,
        timestamp: new Date(),
        processed: 0
      });
    } catch (error) {
      console.error('Error adding audio to queue:', error);
      throw new Error('Failed to add audio to queue');
    }
  }

  private async processAudioItem(audioItem: any): Promise<void> {
    // Simulação de processamento de áudio
    // Em produção, aqui você chamaria o serviço de transcrição
    const mockTransaction = {
      amount: Math.floor(Math.random() * 100) + 10,
      type: Math.random() > 0.5 ? 'income' : 'expense' as 'income' | 'expense',
      category: 'Outros',
      description: 'Transação processada offline',
      date: new Date()
    };

    await this.transactionService.addTransaction(mockTransaction);
  }
}

// Service Factory seguindo Factory Pattern
export class ServiceFactory {
  private static transactionService: ITransactionService;
  private static categoryService: ICategoryService;
  private static offlineService: IOfflineService;

  static getTransactionService(): ITransactionService {
    if (!this.transactionService) {
      this.transactionService = new TransactionService();
    }
    return this.transactionService;
  }

  static getCategoryService(): ICategoryService {
    if (!this.categoryService) {
      this.categoryService = new CategoryService();
    }
    return this.categoryService;
  }

  static getOfflineService(): IOfflineService {
    if (!this.offlineService) {
      this.offlineService = new OfflineService();
    }
    return this.offlineService;
  }
}
