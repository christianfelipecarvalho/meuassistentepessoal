import { Category, ParsedTransaction, Transaction } from '@/types';

// Domain Entities seguindo Single Responsibility Principle
export class TransactionEntity {
  constructor(
    public readonly id: number | undefined,
    public readonly amount: number,
    public readonly type: 'income' | 'expense',
    public readonly category: string,
    public readonly description: string,
    public readonly date: Date,
    public readonly audioBlob?: Blob
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!this.type || !['income', 'expense'].includes(this.type)) {
      throw new Error('Type must be either income or expense');
    }
    if (!this.category || this.category.trim().length === 0) {
      throw new Error('Category is required');
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Description is required');
    }
  }

  public isIncome(): boolean {
    return this.type === 'income';
  }

  public isExpense(): boolean {
    return this.type === 'expense';
  }

  public getFormattedAmount(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.amount);
  }

  public getFormattedDate(): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(this.date);
  }

  public static fromParsedTransaction(parsed: ParsedTransaction, audioBlob?: Blob): TransactionEntity {
    return new TransactionEntity(
      undefined,
      parsed.amount,
      parsed.type,
      parsed.category,
      parsed.description,
      parsed.date,
      audioBlob
    );
  }

  public toPlainObject(): Transaction {
    return {
      id: this.id,
      amount: this.amount,
      type: this.type,
      category: this.category,
      description: this.description,
      date: this.date,
      audioBlob: this.audioBlob
    };
  }
}

export class CategoryEntity {
  constructor(
    public readonly id: number | undefined,
    public readonly name: string,
    public readonly color: string,
    public readonly icon: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    if (!this.color || this.color.trim().length === 0) {
      throw new Error('Category color is required');
    }
    if (!this.icon || this.icon.trim().length === 0) {
      throw new Error('Category icon is required');
    }
  }

  public toPlainObject(): Category {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      icon: this.icon
    };
  }
}

// Value Objects
export class Money {
  constructor(private readonly amount: number) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
  }

  public getValue(): number {
    return this.amount;
  }

  public add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  public subtract(other: Money): Money {
    return new Money(this.amount - other.amount);
  }

  public format(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.amount);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount;
  }
}

// Domain Services
export class TransactionCalculationService {
  public calculateTotal(transactions: TransactionEntity[], type: 'income' | 'expense'): Money {
    const filteredTransactions = transactions.filter(t => t.type === type);
    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    return new Money(total);
  }

  public calculateBalance(transactions: TransactionEntity[]): Money {
    const incomeTotal = this.calculateTotal(transactions, 'income');
    const expenseTotal = this.calculateTotal(transactions, 'expense');
    return incomeTotal.subtract(expenseTotal);
  }

  public groupByCategory(transactions: TransactionEntity[]): Map<string, TransactionEntity[]> {
    const grouped = new Map<string, TransactionEntity[]>();
    
    transactions.forEach(transaction => {
      const category = transaction.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(transaction);
    });

    return grouped;
  }
}
