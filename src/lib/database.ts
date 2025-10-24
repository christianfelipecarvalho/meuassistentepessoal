import { AudioQueueItem, Category, Transaction } from '@/types';
import Dexie, { Table } from 'dexie';

export class Database extends Dexie {
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

export const db = new Database();

// Inicializar categorias padrão
export const initializeDefaultCategories = async (): Promise<void> => {
  const existingCategories = await db.categories.count();
  
  if (existingCategories === 0) {
    await db.categories.bulkAdd([
      { name: 'Alimentação', color: '#ef4444', icon: '🍽️' },
      { name: 'Transporte', color: '#06b6d4', icon: '🚗' },
      { name: 'Saúde', color: '#3b82f6', icon: '🏥' },
      { name: 'Educação', color: '#10b981', icon: '📚' },
      { name: 'Lazer', color: '#f59e0b', icon: '🎮' },
      { name: 'Casa', color: '#8b5cf6', icon: '🏠' },
      { name: 'Roupas', color: '#ec4899', icon: '👕' },
      { name: 'Outros', color: '#6b7280', icon: '📦' }
    ]);
  }
};

// Funções utilitárias para o banco de dados
export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    return await db.transactions.orderBy('date').reverse().toArray();
  },

  async add(transaction: Omit<Transaction, 'id'>): Promise<number> {
    const id = await db.transactions.add(transaction);
    return typeof id === 'number' ? id : parseInt(id.toString());
  },

  async update(id: number, changes: Partial<Transaction>): Promise<number> {
    return await db.transactions.update(id, changes);
  },

  async delete(id: number): Promise<void> {
    await db.transactions.delete(id);
  },

  async getByCategory(category: string): Promise<Transaction[]> {
    return await db.transactions.where('category').equals(category).toArray();
  },

  async getByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    return await db.transactions.where('type').equals(type).toArray();
  }
};

export const categoryService = {
  async getAll(): Promise<Category[]> {
    return await db.categories.toArray();
  },

  async add(category: Omit<Category, 'id'>): Promise<number> {
    const id = await db.categories.add(category);
    return typeof id === 'number' ? id : parseInt(id.toString());
  },

  async update(id: number, changes: Partial<Category>): Promise<number> {
    return await db.categories.update(id, changes);
  },

  async delete(id: number): Promise<void> {
    await db.categories.delete(id);
  }
};

export const audioQueueService = {
  async add(audioItem: Omit<AudioQueueItem, 'id'>): Promise<number> {
    const id = await db.audioQueue.add(audioItem);
    return typeof id === 'number' ? id : parseInt(id.toString());
  },

  async getPending(): Promise<AudioQueueItem[]> {
    return await db.audioQueue.where('processed').equals(0).toArray();
  },

  async markAsProcessed(id: number): Promise<number> {
    return await db.audioQueue.update(id, { processed: 1 });
  },

  async clearProcessed(): Promise<void> {
    await db.audioQueue.where('processed').equals(1).delete();
  }
};
