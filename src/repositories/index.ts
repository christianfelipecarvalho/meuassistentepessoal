import {
    AudioQueueItem,
    Category,
    IAudioQueueRepository,
    ICategoryRepository,
    ITransactionRepository,
    Transaction
} from '@/interfaces';
import Dexie, { Table } from 'dexie';

// Database implementation seguindo Dependency Inversion Principle
class Database extends Dexie {
  transactions!: Table<Transaction>;
  audioQueue!: Table<AudioQueueItem>;
  categories!: Table<Category>;

  constructor() {
    super('MeuAssistenteDB');
    
    this.version(1).stores({
      transactions: '++id, amount, type, category, description, date, audioBlob',
      audioQueue: '++id, audioBlob, timestamp, processed',
      categories: '++id, name, color, icon'
    });
  }
}

const db = new Database();

// Transaction Repository Implementation
export class TransactionRepository implements ITransactionRepository {
  async getAll(): Promise<Transaction[]> {
    try {
      return await db.transactions.orderBy('date').reverse().toArray();
    } catch (error) {
      console.error('Error getting all transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  async add(transaction: Omit<Transaction, 'id'>): Promise<number> {
    try {
      const id = await db.transactions.add(transaction);
      return typeof id === 'number' ? id : parseInt(id.toString());
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw new Error('Failed to add transaction');
    }
  }

  async update(id: number, changes: Partial<Transaction>): Promise<number> {
    try {
      return await db.transactions.update(id, changes);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw new Error('Failed to update transaction');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await db.transactions.delete(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw new Error('Failed to delete transaction');
    }
  }

  async getByCategory(category: string): Promise<Transaction[]> {
    try {
      return await db.transactions.where('category').equals(category).toArray();
    } catch (error) {
      console.error('Error getting transactions by category:', error);
      throw new Error('Failed to retrieve transactions by category');
    }
  }

  async getByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    try {
      return await db.transactions.where('type').equals(type).toArray();
    } catch (error) {
      console.error('Error getting transactions by type:', error);
      throw new Error('Failed to retrieve transactions by type');
    }
  }
}

// Category Repository Implementation
export class CategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    try {
      return await db.categories.toArray();
    } catch (error) {
      console.error('Error getting all categories:', error);
      throw new Error('Failed to retrieve categories');
    }
  }

  async add(category: Omit<Category, 'id'>): Promise<number> {
    try {
      const id = await db.categories.add(category);
      return typeof id === 'number' ? id : parseInt(id.toString());
    } catch (error) {
      console.error('Error adding category:', error);
      throw new Error('Failed to add category');
    }
  }

  async update(id: number, changes: Partial<Category>): Promise<number> {
    try {
      return await db.categories.update(id, changes);
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await db.categories.delete(id);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }
}

// Audio Queue Repository Implementation
export class AudioQueueRepository implements IAudioQueueRepository {
  async add(audioItem: Omit<AudioQueueItem, 'id'>): Promise<number> {
    try {
      const id = await db.audioQueue.add(audioItem);
      return typeof id === 'number' ? id : parseInt(id.toString());
    } catch (error) {
      console.error('Error adding audio to queue:', error);
      throw new Error('Failed to add audio to queue');
    }
  }

  async getPending(): Promise<AudioQueueItem[]> {
    try {
      return await db.audioQueue.where('processed').equals(0).toArray();
    } catch (error) {
      console.error('Error getting pending audio:', error);
      throw new Error('Failed to retrieve pending audio');
    }
  }

  async markAsProcessed(id: number): Promise<number> {
    try {
      return await db.audioQueue.update(id, { processed: 1 });
    } catch (error) {
      console.error('Error marking audio as processed:', error);
      throw new Error('Failed to mark audio as processed');
    }
  }

  async clearProcessed(): Promise<void> {
    try {
      await db.audioQueue.where('processed').equals(1).delete();
    } catch (error) {
      console.error('Error clearing processed audio:', error);
      throw new Error('Failed to clear processed audio');
    }
  }
}

// Factory para criar instâncias dos repositórios
export class RepositoryFactory {
  private static transactionRepository: ITransactionRepository;
  private static categoryRepository: ICategoryRepository;
  private static audioQueueRepository: IAudioQueueRepository;

  static getTransactionRepository(): ITransactionRepository {
    if (!this.transactionRepository) {
      this.transactionRepository = new TransactionRepository();
    }
    return this.transactionRepository;
  }

  static getCategoryRepository(): ICategoryRepository {
    if (!this.categoryRepository) {
      this.categoryRepository = new CategoryRepository();
    }
    return this.categoryRepository;
  }

  static getAudioQueueRepository(): IAudioQueueRepository {
    if (!this.audioQueueRepository) {
      this.audioQueueRepository = new AudioQueueRepository();
    }
    return this.audioQueueRepository;
  }
}
